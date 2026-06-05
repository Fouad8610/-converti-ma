export default async function handler(req, res) {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileData, fileName, type } = req.body;
    
    let inputFormat, outputFormat;
    if (type === 'pdf-docx') {
      inputFormat = 'pdf';
      outputFormat = 'docx';
    } else {
      inputFormat = 'docx';
      outputFormat = 'pdf';
    }
    
    const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNTIwODA1ZmUxNDc1OWJhZDcyNmM5YTE0MTNjOGUwNDQ3Zjc1YWExM2QwNjE1ZWZmZjY5MWJkM2Y3M2YxNWU5MGYyZDhlMDNhNzFhNTdkOTQiLCJpYXQiOjE3ODA2ODE0OTIuNjU4NTcxLCJuYmYiOjE3ODA2ODE0OTIuNjU4NTcyLCJleHAiOjQ5MzYzNTUwOTIuNjUzOTQ2LCJzdWIiOiI3NTg2MDE4NSIsInNjb3BlcyI6WyJ0YXNrLndyaXRlIiwidGFzay5yZWFkIl19.p-tG10KPLrxfl2eppvfnLcEmMxq3kBc-gIHv7ipfuKOMcEESH3xF4fjBJL20B4Q_VpTOCDT5bCY76ffH7vMEe72LyAJgT6H1QM4BBPsHNPefPMVHkSx8XQ9AHhi-L4cLpK8t_oIDYK1aJQYGKVnCQEel31dmdKNi1bnGhfjRljS4R3jjVar2yjfjTtEBaANYzx3e9eep2yBHrII-6uldt3oqXzen-01hH2AHClmcmYKyt6jeOyi4XgXvBY0LEKjGb4Wj4nXGOyUDPhYXCt2Qqq8GFN0zAmw2W8FR84zi6qeJ4BQicnJeYyA5W90iB0oRwPMviqOViSx10vdcdc1OTLFib7Xn5COIAcvj8wBy7uAJSTXqvGMkEWo1ceZFu4gar8jIDmGpKbqdmIpXXS7xoWuscoW1tQdtPrwtXXGEjl9lcoh6qWDqCHqQXAWwQCBXW6kCn2qKf6J-P7ZnvjZVEpppTOpnHoRb_5FzLtFF-zP7TdkhaykXoe90CVwQlCgfehjcbqenmQwkoB3Axblhpo2Vd78_v1oR39mbbr4EHV4dk_X1YL67I4kK6LoL0xfpdPwEbaUk0RvekSI-qDjMCL-kRG1-wGvA2GCB5j-n-fkOJjdecQQpKK15DwAa7N4lxqQrf0UdXfnAIoljhKPSY4yg9mCuUh6PhHbTfbXcF80`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "tasks": {
          "import-1": { "operation": "import/base64", "file": fileData, "filename": fileName },
          "convert-1": { "operation": "convert", "input": "import-1", "input_format": inputFormat, "output_format": outputFormat },
          "export-1": { "operation": "export/url", "input": "convert-1" }
        }
      })
    });

    const job = await jobRes.json();
    const exportTask = job.data.tasks.find(t => t.name === 'export-1');
    
    let exportResult;
    for (let i = 0; i < 20; i++) {
      const checkRes = await fetch(`https://api.cloudconvert.com/v2/tasks/${exportTask.id}`, {
        headers: { 'Authorization': `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNTIwODA1ZmUxNDc1OWJhZDcyNmM5YTE0MTNjOGUwNDQ3Zjc1YWExM2QwNjE1ZWZmZjY5MWJkM2Y3M2YxNWU5MGYyZDhlMDNhNzFhNTdkOTQiLCJpYXQiOjE3ODA2ODE0OTIuNjU4NTcxLCJuYmYiOjE3ODA2ODE0OTIuNjU4NTcyLCJleHAiOjQ5MzYzNTUwOTIuNjUzOTQ2LCJzdWIiOiI3NTg2MDE4NSIsInNjb3BlcyI6WyJ0YXNrLndyaXRlIiwidGFzay5yZWFkIl19.p-tG10KPLrxfl2eppvfnLcEmMxq3kBc-gIHv7ipfuKOMcEESH3xF4fjBJL20B4Q_VpTOCDT5bCY76ffH7vMEe72LyAJgT6H1QM4BBPsHNPefPMVHkSx8XQ9AHhi-L4cLpK8t_oIDYK1aJQYGKVnCQEel31dmdKNi1bnGhfjRljS4R3jjVar2yjfjTtEBaANYzx3e9eep2yBHrII-6uldt3oqXzen-01hH2AHClmcmYKyt6jeOyi4XgXvBY0LEKjGb4Wj4nXGOyUDPhYXCt2Qqq8GFN0zAmw2W8FR84zi6qeJ4BQicnJeYyA5W90iB0oRwPMviqOViSx10vdcdc1OTLFib7Xn5COIAcvj8wBy7uAJSTXqvGMkEWo1ceZFu4gar8jIDmGpKbqdmIpXXS7xoWuscoW1tQdtPrwtXXGEjl9lcoh6qWDqCHqQXAWwQCBXW6kCn2qKf6J-P7ZnvjZVEpppTOpnHoRb_5FzLtFF-zP7TdkhaykXoe90CVwQlCgfehjcbqenmQwkoB3Axblhpo2Vd78_v1oR39mbbr4EHV4dk_X1YL67I4kK6LoL0xfpdPwEbaUk0RvekSI-qDjMCL-kRG1-wGvA2GCB5j-n-fkOJjdecQQpKK15DwAa7N4lxqQrf0UdXfnAIoljhKPSY4yg9mCuUh6PhHbTfbXcF80` }
      });
      exportResult = await checkRes.json();
      if (exportResult.data.status === 'finished') break;
      await new Promise(r => setTimeout(r, 1500));
    }

    const fileUrl = exportResult.data.result.files[0].url;
    res.status(200).json({ url: fileUrl });

  } catch (error) {
    res.status(500).json({ error: 'فشل التحويل' });
  }
}
