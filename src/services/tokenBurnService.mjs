
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createBurnInstruction, getAssociatedTokenAddress } from '@solana/spl-token';

export class TokenBurnService {
  constructor(connection) {
    this.connection = connection;
    this.burnTokenMint = new PublicKey(process.env.BURN_TOKEN_MINT);
    this.requiredBurnAmount = 1000;
  }

  async burnTokens(walletAddress, amount = this.requiredBurnAmount) {
    try {
      const userWallet = new PublicKey(walletAddress);
      const associatedTokenAddress = await getAssociatedTokenAddress(
        this.burnTokenMint,
        userWallet
      );

      const burnInstruction = createBurnInstruction(
        associatedTokenAddress,
        this.burnTokenMint,
        userWallet,
        amount
      );

      const transaction = new Transaction().add(burnInstruction);
      
      return transaction;
    } catch (error) {
      throw new Error(`Failed to create burn transaction: ${error.message}`);
    }
  }

  async verifyBurnTransaction(signature) {
    try {
      const transaction = await this.connection.getTransaction(signature);
      return transaction?.meta?.logMessages?.some(log => 
        log.includes('Instruction: Burn')
      );
    } catch (error) {
      return false;
    }
  }
}
