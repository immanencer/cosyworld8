import fs from 'fs';
import path from 'path';
import { request } from 'https';
import { request as httpRequest } from 'http';

export class S3Service {
  constructor({ configService, logger }) {
    this.configService = configService;
    this.logger = logger;

    // Load environment variables
    this.S3_API_KEY = process.env.S3_API_KEY;
    this.S3_API_ENDPOINT = process.env.S3_API_ENDPOINT;
    this.CLOUDFRONT_DOMAIN = process.env.CLOUDFRONT_DOMAIN;

    // Validate environment variables
    if (!this.S3_API_KEY || !this.S3_API_ENDPOINT || !this.CLOUDFRONT_DOMAIN) {
      throw new Error('Missing one or more required environment variables (S3_API_KEY, S3_API_ENDPOINT, CLOUDFRONT_DOMAIN)');
    }
  }

  async uploadImage(filePath) {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        this.logger.error(`Error: File not found at path "${filePath}"`);
        return;
      }

      // Read the image file
      const imageBuffer = fs.readFileSync(filePath);
      const imageBase64 = imageBuffer.toString('base64');
      const imageType = path.extname(filePath).substring(1).toLowerCase(); // e.g., 'png', 'jpg'

      // Validate image type
      const validImageTypes = ['png', 'jpg', 'jpeg', 'gif'];
      if (!validImageTypes.includes(imageType)) {
        this.logger.error(`Error: Unsupported image type ".${imageType}". Supported types: ${validImageTypes.join(', ')}`);
        return;
      }

      // Prepare the request payload
      const payload = JSON.stringify({
        image: imageBase64,
        imageType: imageType,
      });

      // Send POST request to upload the image
      const { protocol, hostname, pathname } = new URL(this.S3_API_ENDPOINT);
      const httpModule = protocol === 'https:' ? request : httpRequest;

      const options = {
        hostname,
        path: pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'x-api-key': this.S3_API_KEY,
        },
      };

      return new Promise((resolve, reject) => {
        const req = httpModule(options, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                const result = JSON.parse(data);
                const responseData = result.body ? JSON.parse(result.body) : result;
          
                if (!responseData || !responseData.url) {
                  this.logger.error(`Invalid S3 response format - missing URL. Response data: ${JSON.stringify(result)}`);
                  reject(new Error('Invalid S3 response - missing URL'));
                  return;
                }
          
                this.logger.info('Upload Successful!');
                this.logger.info(`Image URL: ${responseData.url}`);
                resolve(responseData.url);
              } catch (error) {
                this.logger.error(`Failed to parse S3 response: ${error.message}`);
                this.logger.error(`Raw response data: ${data}`);
                reject(new Error(`Failed to parse S3 response: ${error.message}`));
              }
            } else {
              this.logger.error(`Unexpected response status: ${res.statusCode}. Response: ${data}`);
              reject(new Error(`Upload failed with status: ${res.statusCode}`));
            }
          });
        });

        req.on('error', (error) => {
          this.logger.error('Error uploading image:', error.message);
          reject(error);
        });

        req.write(payload);
        req.end();
      });
    } catch (error) {
      this.logger.error('Error:', error.message);
      throw error;
    }
  }

  async downloadImage(imageUrl) {
    try {
      const { protocol, hostname, pathname } = new URL(imageUrl);
      const httpModule = protocol === 'https:' ? request : httpRequest;

      return new Promise((resolve, reject) => {
        const req = httpModule({ hostname, path: pathname, method: 'GET' }, (res) => {
          if (res.statusCode === 200) {
            const data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => {
              const buffer = Buffer.concat(data);
              this.logger?.info(`Image downloaded successfully from "${imageUrl}"`);
              resolve(buffer);
            });
          } else {
            this.logger?.error(`Failed to download image. Status code: ${res.statusCode}`);
            reject(new Error(`Failed to download image with status: ${res.statusCode}`));
          }
        });

        req.on('error', (error) => {
          this.logger?.error('Error downloading image:', error.message);
          reject(error);
        });

        req.end();
      });
    } catch (error) {
      this.logger?.error('Error:', error.message);
      throw error;
    }
  }
}
