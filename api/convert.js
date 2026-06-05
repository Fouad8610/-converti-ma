export default async function handler(req, res) {
  if (req.method!== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { files, type, pages } = req.body;
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiNTIwODA1ZmUxNDc1OWJhZDcyNmM5YTE0MTNjOGUwNDQ3Zjc1YWExM2QwNjE1ZWZmZjY5MWJkM2Y3M2YxNWU5MGYyZDhlMDNhNzFhNTdkOTQiLCJpYXQiOjE3ODA2ODE0OTIuNjU4NTcxLCJuYmYiOjE3ODA2ODE0OTIuNjU4NTcyLCJleHAiOjQ5MzYzNTUwOTIuNjUzOTQ2LCJzdWIiOiI3NTg2MDE4NSIsInNjb3BlcyI6WyJ0YXNrLndyaXRlIiwidGFzay5yZWFkIl19.p-tG10KPLrxfl2eppvfnLcEmMxq3kBc-gIHv7ipfuKOMcEESH3xF4fjBJL20B4Q_VpTOCDT5bCY76ffH7vMEe72LyAJgT6H1QM4BBPsHNPefPMVHkSx8XQ9AHhi-L4cLpK8t_oIDYK1aJQYGKVnCQEel31dmdKNi1bnGhfjRljS4R3jjVar2yjfjTtEBaANYzx3e9eep2yBHrII-6uldt3oqXzen-01hH2AHClmcmYKyt6jeOyi4XgXvBY0LEKjGb4Wj4nXGOyUDPhYXCt2Qqq8GFN0zAmw2W8FR84zi6qeJ4BQicnJeYyA5W90iB0oRwPMviqOViSx10vdcdc1OTLFib7Xn5COIAcvj8wBy7uAJSTXqvGMkEWo1ceZFu4gar8jIDmGpKbqdmIpXXS7xoWuscoW1tQdtPrwtXXGEjl9lcoh6qWDqCHqQXAWwQCBXW6kCn2qKf6J-P7ZnvjZVEpppTOpnHoRb_5FzLtFF-zP7TdkhaykXoe90CVwQlCgfehjcbqenmQwkoB3Axblhpo2Vd78_v1oR39mbbr4EHV4dk_X1YL67I4kK6LoL0xfpdPwEbaUk0RvekSI-qDjMCL-kRG1-wGvA2GCB5j-n-fkOJjdecQQpKK15DwAa7N4lxqQrf0UdXfnAIoljhKPSY4yg9mCuUh6PhHbTfbXcF80';
    
    let tasks = {};
    
    // 1. Import files
    files.forEach((file, i) => {
      tasks[`import-${i}`] = { operation: 'import/base64', file: file.data, filename: file.name };
    });

    // 2. Operations
    if (type === 'docx-pdf') {
      tasks['convert-1'] = { operation: 'convert', input: 'import-0', input_format: 'docx', output_format: 'pdf' };
      tasks['export-1'] = { operation: 'export/url', input: 'convert-1' };
    } else if (type === 'pdf-docx') {
      tasks['convert-1'] = { operation: 'convert', input: 'import-0', input_format: 'pdf', output_format: 'docx' };
      tasks['export-1'] = { operation: 'export/url', input: 'convert-1' };
    } else if (type === 'compress') {
      tasks['compress-1'] = { operation: 'optimize', input: 'import-0', engine: '3.0' };
      tasks['export-1'] = { operation: 'export/url', input: 'compress-1' };
    } else if (type === 'merge') {
      tasks['merge-1'] = { operation: 'merge', input: files.map((_, i) => `import-${i}`) };
      tasks['export-1'] = { operation: 'export/url', input: 'merge-1' };
    } else if (type === 'pdf-jpg') {
      tasks['convert-1'] = { operation: 'convert', input: 'import-0', output_format: 'jpg', pixel_density: 150 };
      tasks['export-1'] = { operation: 'export/url', input: 'convert-1' };
    } else if (type === 'jpg-pdf') {
      tasks['merge-1'] = { operation: 'merge', input: files.map((_, i) => `import-${i}`), output_format: 'pdf' };
      tasks['export-1'] = { operation: 'export/url', input: 'merge-1' };
    } else if (type === 'split') {
      tasks['split-1'] = { operation: 'split', input: 'import-0', pages: pages || 'all' };
      tasks['export-1'] = { operation: 'export/url', input: 'split-1' };
    } else if (type === 'delete') {
      tasks['delete-1'] = { operation: 'remove', input: 'import-0', pages: pages };
      tasks['export-1'] = { operation: 'export/url', input: 'delete-1' };
    }

    const jobRes = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks })
    });

    const job = await jobRes.json();
    if (job.errors) throw new Error(job.message);
    
    const exportTask = job.data.tasks.find(t => t.operation === 'export/url');
    
    let exportResult;
    for (let i = 0; i < 30; i++) {
      const checkRes = await fetch(`https://api.cloudconvert.com/v2/tasks/${exportTask.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      exportResult = await checkRes.json();
      if (exportResult.data.status === 'finished') break;
      if (exportResult.data.status === 'error') throw new Error('فشل التحويل');
      await new Promise(r => setTimeout(r, 1500));
    }

    const fileUrl = exportResult.data.result.files[0].url;
    res.status(200).json({ url: fileUrl });

  } catch (error) {
    res.status(500).json({ error: error.message || 'فشل التحويل' });
  }
}
