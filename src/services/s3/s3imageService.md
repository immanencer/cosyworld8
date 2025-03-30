# S3 Image Upload/Download Module

This module provides utilities for uploading images to Amazon S3 and downloading them through CloudFront. It includes secure API key handling, input validation, and error management.

⚠️ These instructions haven't been fully tested. Feel free to open a PR for improvements.

## Prerequisites

- AWS Account
- Node.js (v14 or higher)
- AWS CLI (for infrastructure setup)

## Infrastructure Setup

These instructions are from Claude - when setting this up I recommend sharing ../src/services/s3Service.mjs with your Ai assistant. There are various ways to do this, this is meant as a general guide.

### 1. Create S3 Bucket

```bash
aws s3 mb s3://your-bucket-name --region your-region
```

Enable CORS on your S3 bucket by creating a `cors.json` file:

```json
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": []
        }
    ]
}
```

Apply CORS configuration:

```bash
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://cors.json
```

### 2. Create API Gateway

1. Go to AWS API Gateway Console
2. Create a new REST API
3. Create a POST method for `/upload`
4. Set up the integration with an AWS Lambda function
5. Enable API key requirement for the endpoint
6. Deploy the API and create an API key

### 3. Set up CloudFront

1. Create a new CloudFront distribution
2. Set your S3 bucket as the origin
3. Configure the following settings:
   - Viewer Protocol Policy: Redirect HTTP to HTTPS
   - Allowed HTTP Methods: GET, HEAD
   - Restrict Viewer Access: No
   - Cache Policy: Managed-CachingOptimized

### 4. Create Lambda Function

Create a Lambda function to handle the image upload:

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const imageBuffer = Buffer.from(body.image, 'base64');
    
    const params = {
        Bucket: 'your-bucket-name',
        Key: `images/${Date.now()}.${body.imageType}`,
        Body: imageBuffer,
        ContentType: `image/${body.imageType}`
    };
    
    try {
        const result = await s3.upload(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Upload successful',
                url: result.Location
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Upload failed',
                error: error.message
            })
        };
    }
};
```

## Module Installation

1. Install required dependencies:

```bash
npm install dotenv
```

2. Create a `.env` file in your project root:

```env
S3_API_KEY=your_api_gateway_key
S3_API_ENDPOINT=https://your-api-gateway-url/stage/upload
CLOUDFRONT_DOMAIN=https://your-cloudfront-distribution.cloudfront.net
```

## Usage

### Uploading Images

```javascript
import { uploadImage } from './s3-image-module.js';

try {
    const imageUrl = await uploadImage('./path/to/your/image.jpg');
    console.log('Image uploaded successfully:', imageUrl);
} catch (error) {
    console.error('Upload failed:', error);
}
```

### Downloading Images

```javascript
import { downloadImage } from './s3-image-module.js';

try {
    await downloadImage(
        'https://your-cloudfront-distribution.cloudfront.net/images/example.jpg',
        './downloads/example.jpg'
    );
    console.log('Image downloaded successfully');
} catch (error) {
    console.error('Download failed:', error);
}
```

## Security Considerations

1. Always use environment variables for sensitive information
2. Implement proper IAM roles and policies
3. Consider implementing request signing for additional security
4. Regularly rotate API keys
5. Set up appropriate CORS policies
6. Enable CloudFront security features like WAF if needed

## Error Handling

The module includes comprehensive error handling for:
- Missing files
- Invalid image types
- API failures
- Network issues
- File system errors

## Limitations

- Supported image types: PNG, JPG, JPEG, GIF
- Maximum file size depends on your API Gateway and Lambda configurations
- CloudFront caching may affect immediate availability of uploaded images