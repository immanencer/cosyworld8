import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { getDb } from '../services/dbConnection.mjs';

const router = express.Router();

function extractTitle(content) {
  // Look for the first heading
  const match = content.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].trim();
  }
  return null;
}

async function getMarkdownFiles(dir) {
  const files = await fs.readdir(dir);
  const mdFiles = [];

  for (const file of files) {
    if (file.endsWith('.md')) {
      const content = await fs.readFile(path.join(dir, file), 'utf-8');
      const title = extractTitle(content) || file.replace('.md', '');
      mdFiles.push({
        path: file,
        title: title
      });
    }
  }

  return mdFiles;
}

router.get('/pages', async (req, res) => {
  try {
    const pages = await getMarkdownFiles('./docs');
    res.json(pages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/page', async (req, res) => {
  try {
    const filePath = path.join('./docs', req.query.path);
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ content });
  } catch (error) {
    res.status(404).json({ error: 'Page not found' });
  }
});

export default router;
