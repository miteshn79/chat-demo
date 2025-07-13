const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Save JSON to: public/config/demos
app.post('/save-json', (req, res) => {
  const { fileName, content } = req.body;
  if (!fileName || !content) {
    return res.status(400).json({ error: 'Missing fileName or content' });
  }
  const saveDir = path.join(__dirname, 'public', 'config', 'demos');
  const filePath = path.join(saveDir, `${fileName}.json`);
  try {
    fs.mkdirSync(saveDir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    res.json({ success: true, path: `/config/demos/${fileName}.json` });
  } catch (err) {
    console.error('Save JSON error:', err);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve configurator UI
app.get('/config', (req, res) => {
  console.log('Received /config request');
  const filePath = path.join(__dirname, 'public', 'config', 'ui.html');
  console.log('Serving file at:', filePath);
  if (fs.existsSync(filePath)) {
    console.log('File exists, sending...');
    res.sendFile(filePath);
  } else {
    console.log('File not found!');
    res.status(404).send('File not found');
  }
});

// Serve demo selector by default
app.get('/', (req, res) => {
  console.log('Received root / request');
  const demosDir = path.join(__dirname, 'public', 'config', 'demos');
  console.log('Reading demos from:', demosDir);
  fs.readdir(demosDir, (err, files) => {
    if (err) {
      console.error('Error reading demos folder:', err);
      return res.status(500).send('Error loading demos');
    }
    let demos = files.filter(f => f.endsWith('.json')).map(f => f.slice(0, -5));
    let options = '<option value="">Select a demo</option>';
    demos.forEach(demo => {
      options += `<option value="${demo}">${demo}</option>`;
    });
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo Selector</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        background-color: #f5f5f5;
      }
      h1 {
        color: #333;
        text-align: center;
      }
      select {
        width: 100%;
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 16px;
      }
      a {
        display: inline-block;
        padding: 10px 20px;
        margin-top: 10px;
        background-color: #007BFF;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        text-align: center;
      }
      a:hover {
        background-color: #0056b3;
      }
    </style>
    <script>
      function goToDemo() {
        var select = document.getElementById('demo-select');
        var value = select.value;
        if (value) {
          window.location.href = '/config/index.html?demo=' + value;
        }
      }
    </script>
</head>
<body>
    <h1>Select a Demo</h1>
    <select id="demo-select" onchange="goToDemo()">
      ${options}
    </select>
    <br><br>
    <a href="/config/ui.html">Create New Demo</a>
</body>
</html>
    `;
    res.send(html);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).send('Server error!');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});