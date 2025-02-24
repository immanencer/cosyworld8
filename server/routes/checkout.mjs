
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function serveCheckout(req, res) {
  try {
    let html = await fs.readFile(path.join(__dirname, '../../public/checkout.html'), 'utf-8');
    html = html.replace('"{{CROSSMINT_CLIENT_API_KEY}}"', `"${process.env.CROSSMINT_CLIENT_API_KEY}"`);
    res.send(html);
  } catch (error) {
    console.error('Error serving checkout:', error);
    res.status(500).send('Error loading checkout page');
  }
}
