# Arweave Image Module

Upload and retrieve images using Arweave's permanent storage network. Supports both local testing and mainnet deployment.

## Prerequisites

- Node.js v14+
- npm or yarn

## Installation

```bash
npm install arweave arlocal dotenv
```

## Quick Start

### Generate a Wallet

```bash
# Generate testnet wallet (auto-funded)
node generate-wallet.mjs

# Generate mainnet wallet (requires manual funding)
node generate-wallet.mjs mainnet
```

### Run Tests

```bash
# Test with local Arweave network
node arweave-test.mjs

# Test with mainnet
node arweave-test.mjs mainnet
```

### Upload an Image

```javascript
import { uploadImage } from './arweave-image.mjs';

const result = await uploadImage('./image.jpg');
console.log(`Image URL: ${result.url}`);
```

## Supported Image Types

- PNG
- JPG/JPEG
- GIF

## Network Configuration

### Testing Environment (Default)
```javascript
const arweave = Arweave.init({
  host: 'localhost',
  port: 1984,
  protocol: 'http'
});
```

### Mainnet
```javascript
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});
```

## Important Notes

### Testing
- Local network provides instant confirmations
- Test wallets are auto-funded
- Perfect for development and testing

### Mainnet
- Requires AR tokens
- Transactions take 10-30 minutes to confirm
- Files are permanent and cannot be deleted
- Costs vary based on file size and network conditions

## Error Handling

The module handles:
- Missing/invalid wallets
- Insufficient balance
- Network issues
- Invalid file types

## Security

- Never commit wallet files to version control
- Use environment variables for configuration
- Keep backups of mainnet wallets

## Transaction Tags

Each upload includes:
- Content-Type
- File-Hash
- Original-Name
- Upload-Date

## File Size Considerations

Large files:
- Cost more AR tokens
- Take longer to upload
- May require chunked uploading

## View Transactions

- Testnet: Local logs only
- Mainnet: https://viewblock.io/arweave/tx/[TX_ID]
