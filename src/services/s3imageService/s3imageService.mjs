import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

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
    const payload = {
      image: imageBase64,
      imageType: imageType,
    };

    // Send POST request to upload the image
    const response = await axios.post(S3_API_ENDPOINT, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': S3_API_KEY,
      },
    });

    if (response.status === 200) {
      console.log(response.data.statusCode);
      const { message, url } = JSON.parse(response.data.body);
      console.log('Upload Successful!');
      console.log(`Message: ${message}`);
      console.log(`Image URL: ${url}`);
      return url;
    } else {
      console.error(`Unexpected response status: ${response.status}`);
      console.error(response.data);
    }
  } catch (error) {
    if (error.response) {
      console.error(`Upload Failed with status ${error.response.status}:`, error.response.data);
    } else {
      console.error('Error uploading image:', error.message);
    }
    throw error; // Re-throw error instead of just logging
  }
}

export async function downloadImage(imageUrl, savePath) {
  try {
    // Validate the image URL
    if (!imageUrl.startsWith(CLOUDFRONT_DOMAIN)) {
      console.error(`Error: The image URL must start with your CloudFront domain (${CLOUDFRONT_DOMAIN})`);
      return;
    }

    // Send GET request to download the image
    const response = await axios.get(imageUrl, {
      responseType: 'stream',
    });

    if (response.status === 200) {
      // Ensure the save directory exists
      const dir = path.dirname(savePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create a write stream to save the image
      const writer = fs.createWriteStream(savePath);

      // Pipe the response data to the file
      response.data.pipe(writer);

      // Return a promise that resolves when the download is complete
      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`Image downloaded successfully and saved to "${savePath}"`);
          resolve();
        });
        writer.on('error', (err) => {
          console.error('Error writing the image to disk:', err.message);
          reject(err);
        });
      });
    } else {
      console.error(`Failed to download image. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error downloading image:', error.message);
    throw error; // Re-throw error instead of just logging
  }
}
