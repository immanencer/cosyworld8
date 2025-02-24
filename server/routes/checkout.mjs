
import fs from 'fs/promises';
import path from 'path';

export async function serveCheckout(req, res) {
  try {
    let html = await fs.readFile('public/checkout.html', 'utf-8');
    html = html.replace('"{{CROSSMINT_CLIENT_API_KEY}}"', `"${process.env.CROSSMINT_CLIENT_API_KEY}"`);
    res.send(html);
  } catch (error) {
    console.error('Error serving checkout:', error);
    res.status(500).send('Error loading checkout page');
  }
}
