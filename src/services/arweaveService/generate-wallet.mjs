import Arweave from 'arweave';
import pkg from 'arlocal';
const ArLocal = pkg.default;
import fs from 'fs';

async function getArweave(network = 'testnet') {
  if (network === 'mainnet') {
    return Arweave.init({
      host: 'arweave.net',
      port: 443,
      protocol: 'https'
    });
  } else {
    // Dynamic import for ArLocal
    const arlocal = new ArLocal();
    await arlocal.start();
    
    const arweave = Arweave.init({
      host: 'localhost',
      port: 1984,
      protocol: 'http'
    });

    return { arweave, arlocal };
  }
}

async function generateWallet(network = 'testnet') {
  let arlocal;
  try {
    console.log(`\nGenerating wallet for ${network}...`);
    const connection = await getArweave(network);
    const arweave = network === 'mainnet' ? connection : connection.arweave;
    arlocal = network === 'mainnet' ? null : connection.arlocal;

    // Generate wallet
    const wallet = await arweave.wallets.generate();
    const address = await arweave.wallets.jwkToAddress(wallet);

    // Save wallet
    fs.writeFileSync('./arweave-wallet.json', JSON.stringify(wallet, null, 2));

    if (network === 'testnet') {
      // Fund test wallet
      await arweave.api.get(`mint/${address}/1000000000000`);
    }

    // Get balance
    const winston = await arweave.wallets.getBalance(address);
    const ar = arweave.ar.winstonToAr(winston);

    console.log('\nWallet generated successfully!');
    console.log(`Address: ${address}`);
    console.log(`Balance: ${ar} AR`);
    console.log('Wallet saved to: arweave-wallet.json');

    if (network === 'mainnet') {
      console.log('\nIMPORTANT: Please fund this wallet with AR tokens before use.');
      console.log(`View at: https://viewblock.io/arweave/address/${address}`);
    }

    if (arlocal) {
      await arlocal.stop();
      console.log('\nLocal test environment stopped');
    }

  } catch (error) {
    console.error('Failed to generate wallet:', error);
    if (arlocal) await arlocal.stop();
    process.exit(1);
  }
}

// Get network from command line argument
const network = process.argv[2] === 'mainnet' ? 'mainnet' : 'testnet';
generateWallet(network);