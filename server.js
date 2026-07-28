import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
const PUBLIC_TEMPLATES_DIR = path.join(__dirname, 'public', 'assets', 'templates');
const ROOT_TEMPLATES_DIR = path.join(__dirname, 'assets', 'templates');

// Ensure target directories exist
fs.mkdirSync(PUBLIC_TEMPLATES_DIR, { recursive: true });
fs.mkdirSync(ROOT_TEMPLATES_DIR, { recursive: true });

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const server = http.createServer((req, res) => {
  setCORSHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // --- GET /api/templates ---
  if (req.method === 'GET' && req.url.startsWith('/api/templates')) {
    try {
      const files = fs.readdirSync(PUBLIC_TEMPLATES_DIR);
      const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));

      const templateList = pngFiles.map((filename, idx) => {
        let displayName = filename.replace(/\.png$/i, '');
        if (displayName === 'Happy cust') displayName = 'Happy Cust';
        return {
          id: `disk-${idx}-${filename}`,
          name: displayName,
          src: `assets/templates/${filename}`,
          filename: filename
        };
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(templateList));
    } catch (err) {
      console.error('Error reading templates directory:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read templates' }));
    }
    return;
  }

  // --- POST /api/templates (Save uploaded image to disk) ---
  if (req.method === 'POST' && req.url === '/api/templates') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { name, imageBase64 } = payload;

        if (!name || !imageBase64) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing template name or image data' }));
          return;
        }

        // Sanitize filename
        const safeName = name.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
        const filename = `${safeName || 'custom-template'}.png`;

        // Strip Base64 header prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Save to public/assets/templates/ and assets/templates/
        const publicPath = path.join(PUBLIC_TEMPLATES_DIR, filename);
        const rootPath = path.join(ROOT_TEMPLATES_DIR, filename);

        fs.writeFileSync(publicPath, buffer);
        fs.writeFileSync(rootPath, buffer);

        console.log(`Saved template file to disk: ${filename} (${buffer.length} bytes)`);

        const savedTemplate = {
          id: `disk-${Date.now()}-${filename}`,
          name: safeName,
          src: `assets/templates/${filename}`,
          filename: filename
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(savedTemplate));
      } catch (err) {
        console.error('Error saving template file:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to save file to disk' }));
      }
    });
    return;
  }

  // --- DELETE /api/templates (Delete image file from disk) ---
  if (req.method === 'DELETE' && req.url.startsWith('/api/templates')) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const filename = payload.filename;

        if (filename) {
          const publicPath = path.join(PUBLIC_TEMPLATES_DIR, filename);
          const rootPath = path.join(ROOT_TEMPLATES_DIR, filename);

          if (fs.existsSync(publicPath)) fs.unlinkSync(publicPath);
          if (fs.existsSync(rootPath)) fs.unlinkSync(rootPath);
          console.log(`Deleted template file from disk: ${filename}`);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error('Error deleting template file:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to delete file' }));
      }
    });
    return;
  }

  res.writeHead(440, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Template Disk Server running at http://localhost:${PORT}`);
});
