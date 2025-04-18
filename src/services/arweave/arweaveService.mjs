import { BasicService } from '../foundation/basicService.mjs';
import pkg from 'arweave';
const { Arweave } = pkg;


export class ArweaveService extends BasicService {
    static requiredServices = [
        'configService',
        'databaseService'
    ];
    constructor(services) {
        super(services);

        this.arweave = null;
    }
    
    async initialize() {
    }

    async getTransactionData(transactionId) {
        try {
            const transaction = await this.arweave.transactions.get(transactionId);
            return transaction;
        } catch (error) {
            this.logger.error(`Error fetching transaction data: ${error}`);
            throw error;
        }
    }

    async uploadData(data) {
        try {
            const transaction = await this.arweave.createTransaction({ data });
            await this.arweave.transactions.sign(transaction);
            const response = await this.arweave.transactions.post(transaction);
            return response;
        } catch (error) {
            this.logger.error(`Error uploading data: ${error}`);
            throw error;
        }
    }
    async getData(transactionId) {
        try {
            const transaction = await this.arweave.transactions.get(transactionId);
            const data = await this.arweave.transactions.getData(transactionId, { decode: true, string: true });
            return data;
        } catch (error) {
            this.logger.error(`Error fetching data: ${error}`);
            throw error;
        }
    }

    async getTransactionStatus(transactionId) {
        try {
            const status = await this.arweave.transactions.getStatus(transactionId);
            return status;
        } catch (error) {
            this.logger.error(`Error fetching transaction status: ${error}`);
            throw error;
        }
    }

    async getTransactionConfirmation(transactionId) {
        try {
            const confirmation = await this.arweave.transactions.getConfirmation(transactionId);
            return confirmation;
        } catch (error) {
            this.logger.error(`Error fetching transaction confirmation: ${error}`);
            throw error;
        }
    }

    async getTransactionTags(transactionId) {
        try {
            const transaction = await this.arweave.transactions.get(transactionId);
            return transaction.tags;
        } catch (error) {
            this.logger.error(`Error fetching transaction tags: ${error}`);
            throw error;
        }
    }

    async getTransactionOwner(transactionId) {
        try {
            const transaction = await this.arweave.transactions.get(transactionId);
            return transaction.owner;
        } catch (error) {
            this.logger.error(`Error fetching transaction owner: ${error}`);
            throw error;
        }
    }

}