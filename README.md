<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converti MA - تحويل Word إلى PDF</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 20px; background: #f0f2f5; }
     .box { background: white; padding: 30px; border-radius: 12px; max-width: 500px; margin: 50px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        button { background: #0066ff; color: white; padding: 15px 30px; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; width: 100%; }
        button:disabled { background: #ccc; }
        #status { margin-top: 20px; font-weight: bold; min-height: 24px; }
        input { margin: 20px 0; }
        a { color: #0066ff; font-weight: bold; }
    </style>
</head>
<body>
    <div class="box">
        <h1>حوّل Word إلى PDF مجاناً</h1>
        <p>ارفع ملف Word وغادي نرجعو ليك PDF فثواني</p>
        <input type="file" id="fileInput" accept=".doc,.docx" />
        <br>
        <button onclick="convertFile()" id="btn">حوّل الآن</button>
        <div id="status"></div>
    </div>

    <script>
        async function convertFile() {
            const fileInput = document.getElementById('fileInput');
            const status = document.getElementById('status');
            const btn = document.getElementById('btn');
            const file = fileInput.files[0];
            
            if (!file) {
                status.innerText = 'ختار ملف Word الأول';
                return;
            }
            
            btn.disabled = true;
            status.innerText = 'جاري التحويل... تسنّا شوية ⏳';
            
            const reader = new FileReader();
            reader.onload = async function(e) {
                const base64 = e.target.result.split(',')[1];
                
                try {
                    const res = await fetch('/api/convert', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fileData: base64, fileName: file.name })
                    });
                    
                    const data = await res.json();
                    if (data.url) {
                        status.innerHTML = `✅ تم التحويل بنجاح! <br><a href="${data.url}" target="_blank" download>ضغط هنا لتحميل PDF</a>`;
                    } else {
                        status.innerText = '❌ وقع خطأ فالتحويل: ' + (data.error || '');
                    }
                } catch (error) {
                    status.innerText = '❌ خطأ في الاتصال بالسيرفر';
                }
                btn.disabled = false;
            };
            reader.readAsDataURL(file);
        }
    </script>
</body>
</html>
