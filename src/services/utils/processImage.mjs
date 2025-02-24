// imageProcessor.js
import sharp from 'sharp';
import axios from 'axios';

/**
 * Fetches an image from a URL, resizes it to the specified dimensions, and returns it in Base64 format.
 * @param {string} imageUrl - The URL of the image to process.
 * @param {number} width - The desired width of the output image.
 * @param {number} height - The desired height of the output image.
 * @returns {Promise<string>} - A promise that resolves to the Base64-encoded image string.
 */
export async function processImage(imageUrl, width, height) {
  try {
    // Fetch the image from the URL
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    // Resize the image
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(width, height, {
        fit: sharp.fit.cover,
        position: sharp.strategy.entropy,
      })
      .toBuffer();

    // Convert to Base64
    const base64Image = resizedImageBuffer.toString('base64');

    // Return Base64-encoded image with MIME type
    return `${base64Image}`;
  } catch (error) {
    console.error('Error processing image:', error.message);
    throw new Error('Failed to process image');
  }
}

