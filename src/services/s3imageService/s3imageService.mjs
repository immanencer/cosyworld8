import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { request } from 'https';
import { request as httpRequest } from 'http';

dotenv.config();

// Load environment variables
const S3_API_KEY = process.env.S3_API_KEY;
const S3_API_ENDPOINT = process.env.S3_API_ENDPOINT;
const CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

// Validate environment variables
if (!S3_API_KEY || !S3_API_ENDPOINT || !CLOUDFRONT_DOMAIN) {
  throw new Error('Missing one or more required environment variables (S3_API_KEY, S3_API_ENDPOINT, CLOUDFRONT_DOMAIN)');
}

export async function uploadImage(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Error: File not found at path "${filePath}"`);
      return;
    }

    // Read the image file
    const imageBuffer = fs.readFileSync(filePath);
    const imageBase64 = imageBuffer.toString('base64');
    const imageType = path.extname(filePath).substring(1).toLowerCase(); // e.g., 'png', 'jpg'

    // Validate image type
    const validImageTypes = ['png', 'jpg', 'jpeg', 'gif'];
    if (!validImageTypes.includes(imageType)) {
      console.error(`Error: Unsupported image type ".${imageType}". Supported types: ${validImageTypes.join(', ')}`);
      return;
    }

    // Prepare the request payload
    const payload = JSON.stringify({
      image: imageBase64,
      imageType: imageType,
    });

    // Send POST request to upload the image
    const { protocol, hostname, pathname } = new URL(S3_API_ENDPOINT);
    const httpModule = protocol === 'https:' ? request : httpRequest;

    const options = {
      hostname,
      path: pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'x-api-key': S3_API_KEY,
      },
    };

    return new Promise((resolve, reject) => {
      const req = httpModule(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            console.log('Upload Successful!');
            const result = JSON.parse(response.body);
            console.log(`Message: ${result.message}`);
            console.log(`Image URL: ${result.url}`);
            resolve(result.url);
          } else {
            console.error(`Unexpected response status: ${res.statusCode}`);
            console.error(data);
            reject(new Error(`Upload failed with status: ${res.statusCode}`));
          }
        });
      });

      req.on('error', (error) => {
        console.error('Error uploading image:', error.message);
        reject(error);
      });

      req.write(payload);
      req.end();
    });
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

export async function downloadImage(imageUrl, savePath) {
  try {
    // Validate the image URL
    if (!imageUrl.startsWith(CLOUDFRONT_DOMAIN)) {
      console.error(`Error: The image URL must start with your CloudFront domain (${CLOUDFRONT_DOMAIN})`);
      return;
    }

    const { protocol, hostname, pathname } = new URL(imageUrl);
    const httpModule = protocol === 'https:' ? request : httpRequest;

    return new Promise((resolve, reject) => {
      const req = httpModule({ hostname, path: pathname, method: 'GET' }, (res) => {
        if (res.statusCode === 200) {
          // Ensure the save directory exists
          const dir = path.dirname(savePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          // Create a write stream to save the image
          const writer = fs.createWriteStream(savePath);
          res.pipe(writer);

          writer.on('finish', () => {
            console.log(`Image downloaded successfully and saved to "${savePath}"`);
            resolve();
          });
          writer.on('error', (err) => {
            console.error('Error writing the image to disk:', err.message);
            reject(err);
          });
        } else {
          console.error(`Failed to download image. Status code: ${res.statusCode}`);
          reject(new Error(`Failed to download image with status: ${res.statusCode}`));
        }
      });

      req.on('error', (error) => {
        console.error('Error downloading image:', error.message);
        reject(error);
      });

      req.end();
    });
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}
