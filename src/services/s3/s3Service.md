# S3 Service

## Overview
The S3Service provides an interface for storing and retrieving files using Amazon S3 or compatible storage services. It handles upload, download, and management of various media assets and data files used throughout the system.

## Functionality
- **File Upload**: Stores files in S3-compatible storage
- **File Retrieval**: Fetches files by key
- **URL Generation**: Creates temporary or permanent access URLs
- **Bucket Management**: Handles bucket creation and configuration
- **Metadata Management**: Sets and retrieves file metadata

## Implementation
The S3Service extends BasicService and uses the AWS SDK to interact with S3-compatible storage services. It supports both direct file operations and signed URL generation for client-side uploads.

```javascript
export class S3Service extends BasicService {
  constructor(container) {
    super(container, [
      'configService',
      'logger',
    ]);
    
    this.initialize();
  }
  
  initialize() {
    const awsConfig = this.configService.get('aws') || {};
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || awsConfig.region || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || awsConfig.accessKeyId,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || awsConfig.secretAccessKey,
      }
    });
    
    this.bucketName = process.env.S3_BUCKET_NAME || awsConfig.bucketName;
    this.initialized = true;
  }
  
  // Methods...
}
```

### Key Methods

#### `uploadFile(fileBuffer, key, contentType, metadata = {})`
Uploads a file buffer to S3 storage with the specified key and content type.

#### `uploadBase64Image(base64Data, key, metadata = {})`
Converts and uploads a base64-encoded image to S3.

#### `getSignedUrl(key, operation, expiresIn = 3600)`
Generates a signed URL for client-side operations (get or put).

#### `downloadFile(key)`
Downloads a file from S3 storage by its key.

#### `deleteFile(key)`
Removes a file from S3 storage.

#### `listFiles(prefix)`
Lists files in the bucket with the specified prefix.

## File Organization
The service uses a structured key format to organize files:
- `avatars/[avatarId]/[filename]` for avatar images
- `locations/[locationId]/[filename]` for location images
- `items/[itemId]/[filename]` for item images
- `temp/[sessionId]/[filename]` for temporary uploads
- `backups/[date]/[filename]` for system backups

## Security Features
- Automatic encryption for sensitive files
- Signed URLs with expiration for controlled access
- Bucket policy enforcement for access control
- CORS configuration for web integration

## Dependencies
- AWS SDK for JavaScript
- ConfigService for AWS credentials and settings
- Logger for operation tracking