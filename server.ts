import express from 'express';
import path from 'path';
import fs from 'fs';
import { handleApiRequest } from './src/server/apiHandler.ts';

const app = express();
const PORT = 3000;

// API routes first
app.use(async (req, res, next) => {
  if (req.url && req.url.startsWith('/api/')) {
    try {
      const handled = await handleApiRequest(req, res);
      if (!handled) next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// Serve static files from dist
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('<!DOCTYPE html><html><body><div id="root">Loading...</div></body></html>');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`AV Productions server running on port ${PORT}`);
});
