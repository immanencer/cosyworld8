import Arweave from 'arweave';
import fs from 'fs';
import path from 'path';

const LOCAL_LOG_PATH = './arweave-upload-log.json';

class ArweaveIndexer {
  constructor(walletPath) {
    this.arweave = Arweave.init({
      host: 'arweave.net',
      port: 443,
      protocol: 'https'
    });

    // Load wallet
    if (!fs.existsSync(walletPath)) {
      throw new Error('Wallet not found');
    }
    this.wallet = JSON.parse(fs.readFileSync(walletPath));
  }

  // Initialize or get local log
  getLocalLog() {
    if (fs.existsSync(LOCAL_LOG_PATH)) {
      return JSON.parse(fs.readFileSync(LOCAL_LOG_PATH));
    }
    return {
      indexTransactionId: null,
      uploads: []
    };
  }

  // Save local log
  saveLocalLog(log) {
    fs.writeFileSync(LOCAL_LOG_PATH, JSON.stringify(log, null, 2));
  }

  // Add new upload to local log
  logUpload(uploadData) {
    const log = this.getLocalLog();
    log.uploads.push({
      ...uploadData,
      timestamp: new Date().toISOString()
    });
    this.saveLocalLog(log);
  }

  // Create and upload index transaction
  async createIndex() {
    const log = this.getLocalLog();
    
    // If no new uploads since last index, skip
    if (log.uploads.length === 0) {
      console.log('No uploads to index');
      return null;
    }

    // Prepare index data
    const indexData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      previousIndex: log.indexTransactionId,
      uploads: log.uploads
    };

    // Create transaction
    const transaction = await this.arweave.createTransaction({
      data: JSON.stringify(indexData)
    }, this.wallet);

    // Add tags for discovery
    transaction.addTag('App-Name', 'ArweaveImageUploader');
    transaction.addTag('Content-Type', 'application/json');
    transaction.addTag('Index-Type', 'image-uploads');
    transaction.addTag('Index-Version', '1.0');
    transaction.addTag('Upload-Count', log.uploads.length.toString());
    if (log.indexTransactionId) {
      transaction.addTag('Previous-Index', log.indexTransactionId);
    }

    // Sign and upload
    await this.arweave.transactions.sign(transaction, this.wallet);
    
    const uploader = await this.arweave.transactions.getUploader(transaction);
    while (!uploader.isComplete) {
      await uploader.uploadChunk();
      console.log(`Indexing: ${uploader.pctComplete}% complete`);
    }

    // Update local log with new index transaction and clear uploads
    log.indexTransactionId = transaction.id;
    log.uploads = []; // Clear uploaded items
    this.saveLocalLog(log);

    return transaction.id;
  }

  // Get the status of a transaction
  async getTransactionStatus(transactionId) {
    try {
      const status = await this.arweave.transactions.getStatus(transactionId);
      return {
        confirmed: status.confirmed,
        blockHeight: status.block_height,
        blockHash: status.block_hash
      };
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return null;
    }
  }
}

export { ArweaveIndexer };