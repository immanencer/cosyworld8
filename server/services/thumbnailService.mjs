import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';

const THUMB_DIR = './public/thumbnails';
const THUMB_SIZE = 128;

class ThumbnailService {
  async ensureThumbnailDir() {
    try {
      await fs.access(THUMB_DIR);
    } catch {
      await fs.mkdir(THUMB_DIR, { recursive: true });
    }
  }

  async generateThumbnail(imageUrl) {
    await this.ensureThumbnailDir();

    if (!imageUrl) {
      return;
    }
    const hash = crypto.createHash('md5').update(imageUrl).digest('hex');
    const thumbnailPath = path.join(THUMB_DIR, `${hash}.webp`);

    try {
      // Check if thumbnail already exists
      await fs.access(thumbnailPath);
      return `/thumbnails/${hash}.webp`;
    } catch {
      // Generate thumbnail
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      await sharp(Buffer.from(buffer))
        .resize(THUMB_SIZE, THUMB_SIZE, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(thumbnailPath);
      return `/thumbnails/${hash}.webp`;
    }
  }
}

export const thumbnailService = new ThumbnailService();