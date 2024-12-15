import dotenv from 'dotenv';
import Arweave from 'arweave';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Load environment variables
const ARWEAVE_WALLET_PATH = process.env.ARWEAVE_WALLET_PATH;
const ARWEAVE_GATEWAY = process.env.ARWEAVE_GATEWAY || 'https://arweave.net';

// Initialize Arweave
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https'
});

// Validate environment variables
if (!ARWEAVE_WALLET_PATH) {
  throw new Error('Missing required environment variable (ARWEAVE_WALLET_PATH)');
}

// Load wallet
let wallet;
try {
  const rawWallet = fs.readFileSync(ARWEAVE_WALLET_PATH);
  wallet = JSON.parse(rawWallet);
} catch (error) {
  throw new Error(`Failed to load Arweave wallet: ${error.message}`);
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
    const imageType = path.extname(filePath).substring(1).toLowerCase();

    // Validate image type
    const validImageTypes = ['png', 'jpg', 'jpeg', 'gif'];
    if (!validImageTypes.includes(imageType)) {
      console.error(`Error: Unsupported image type ".${imageType}". Supported types: ${validImageTypes.join(', ')}`);
      return;
    }

    // Prepare transaction
    const transaction = await arweave.createTransaction({
      data: imageBuffer
    }, wallet);

    // Add tags to make the image discoverable
    transaction.addTag('Content-Type', `image/${imageType}`);
    transaction.addTag('Upload-Time', Date.now().toString());
    transaction.addTag('App-Name', 'ArweaveImageUploader');

    // Sign the transaction
    await arweave.transactions.sign(transaction, wallet);

    // Get the upload cost
    const winston = await arweave.transactions.getPrice(imageBuffer.byteLength);
    const ar = arweave.ar.winstonToAr(winston);
    console.log(`Upload will cost ${ar} AR`);

    // Submit the transaction
    const uploader = await arweave.transactions.getUploader(transaction);

    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
    }

    const imageUrl = `${ARWEAVE_GATEWAY}/${transaction.id}`;
    console.log('Upload Successful!');
    console.log(`Transaction ID: ${transaction.id}`);
    console.log(`Image URL: ${imageUrl}`);
    
    return imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error.message);
    throw error;
  }
}

export async function downloadImage(imageUrl, savePath) {
  try {
    // Validate the image URL
    if (!imageUrl.startsWith(ARWEAVE_GATEWAY)) {
      console.error(`Error: The image URL must start with the Arweave gateway (${ARWEAVE_GATEWAY})`);
      return;
    }

    // Extract transaction ID from URL
    const txId = imageUrl.split('/').pop();

    // Get transaction data
    const data = await arweave.transactions.getData(txId, {
      decode: true,
      string: false
    });

    // Ensure the save directory exists
    const dir = path.dirname(savePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(savePath, Buffer.from(data));
    console.log(`Image downloaded successfully and saved to "${savePath}"`);

    return savePath;
  } catch (error) {
    console.error('Error downloading image:', error.message);
    throw error;
  }
}

// Utility function to get wallet balance
export async function getWalletBalance() {
  try {
    const address = await arweave.wallets.jwkToAddress(wallet);
    const winston = await arweave.wallets.getBalance(address);
    const ar = arweave.ar.winstonToAr(winston);
    return ar;
  } catch (error) {
    console.error('Error getting wallet balance:', error.message);
    throw error;
  }
}