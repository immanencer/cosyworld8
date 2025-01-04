
import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

async function getMarkdownFiles(dir) {
  const files = await fs.readdir(dir);
  const mdFiles = [];

  for (const file of files) {
    if (file.endsWith('.md')) {
      const content = await fs.readFile(path.join(dir, file), 'utf-8');
      const title = content.split('\n')[0].replace('#', '').trim();
      mdFiles.push({
        path: file,
        title: title || file
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
