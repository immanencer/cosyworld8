# Token Service

## Overview
The Token Service provides a complete interface for creating and managing blockchain tokens on the Solana network. It integrates with the Moonshot SDK to facilitate token creation, transaction management, and wallet interactions, abstracting away the complexities of blockchain development.

## Functionality
- **Token Creation**: Generates new tokens with customizable parameters (name, symbol, description, icons)
- **Transaction Preparation**: Creates and prepares mint transactions for user signing
- **Transaction Submission**: Submits signed transactions to the blockchain
- **Parameter Validation**: Ensures all token parameters meet platform requirements
- **Error Handling**: Robust error handling for blockchain interactions

## Implementation
The service implements a facade pattern over the Moonshot SDK, providing a simplified interface for token operations. It initializes with the appropriate blockchain environment based on configuration settings:

```javascript
export class TokenService {
  constructor() {
    this.rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.moonshot = new Moonshot({
      rpcUrl: this.rpcUrl,
      environment: Environment.DEVNET,
      chainOptions: {
        solana: { confirmOptions: { commitment: 'confirmed' } },
      },
    });
  }
}
```

### Token Creation Process
The token creation follows a two-step process:

1. **Prepare Mint**: Sets up the token parameters and prepares the transaction
   ```javascript
   async createToken({ name, symbol, description, icon, banner, walletAddress }) {
     // Validate parameters
     if (!name || !symbol || !description || !icon || !banner || !walletAddress) {
       throw new Error('Missing required token parameters');
     }
     
     // Normalize symbol
     symbol = symbol.substring(0, 4).toUpperCase();
     
     // Prepare mint params
     const mintParams = {
       creator: walletAddress,
       name,
       symbol,
       curveType: CurveType.CONSTANT_PRODUCT_V1,
       migrationDex: MigrationDex.RAYDIUM,
       icon,
       description,
       links: [{ url: 'https://www.moonstone-sanctum.com', label: 'Website' }],
       banner,
       tokenAmount: '42000000000',
     };
     
     const prepMint = await this.moonshot.prepareMintTx(mintParams);
     return prepMint;
   }
   ```

2. **Submit Signed Transaction**: After user signing, submit the transaction to the network
   ```javascript
   async submitSignedTransaction(signedTx, tokenId) {
     const res = await this.moonshot.submitMintTx({
       tokenId,
       signedTransaction: signedTx
     });
     return res;
   }
   ```

## Dependencies
- **Moonshot SDK**: External dependency for Solana token operations
- **Environment Variables**:
  - `SOLANA_RPC_URL`: URL for the Solana network RPC endpoint
- **Solana Web3.js**: For blockchain interactions

## Integration
The TokenService integrates with other system components:

1. **Web Routes**: Exposed through the web service for frontend interaction
2. **Avatar Service**: For associating tokens with avatars
3. **Web3 Wallet**: For transaction signing by users

## Usage Examples

### Creating a New Token
```javascript
// In a web route or other service
const tokenService = new TokenService();

// Step 1: Prepare the token
const tokenPrep = await tokenService.createToken({
  name: "Moonstone",
  symbol: "MOON",
  description: "The official token for Moonstone Sanctum",
  icon: "https://example.com/icon.png",
  banner: "https://example.com/banner.png",
  walletAddress: "8dHEEnEajfcgRRb2KfYAqjLrc1EceBe3YfKUEn1WcJCX"
});

// Returns token data including tokenId for the client to sign
// Frontend handles signing process

// Step 2: Submit signed transaction
const result = await tokenService.submitSignedTransaction(
  signedTransactionBase64,
  tokenPrep.tokenId
);
```

## Error Handling
The service implements comprehensive error handling with informative messages:

```javascript
try {
  // Token operation
} catch (error) {
  console.error('Error creating token:', {
    error: error.message,
    stack: error.stack,
    name: error.name
  });
  
  if (error.response) {
    console.error('API Response:', {
      status: error.response.status,
      data: error.response.data
    });
  }
  
  throw new Error(`Failed to create token: ${error.message}`);
}
```

## Future Improvements

### Enhanced Token Features
- Add support for custom token metadata
- Implement token transfer functionality
- Add token balance checking capabilities

### Security Enhancements
- Add signature verification for token operations
- Implement rate limiting for token creation
- Add additional validation for token parameters

### Monitoring and Analytics
- Add token creation and transaction monitoring
- Implement analytics for token usage and distribution