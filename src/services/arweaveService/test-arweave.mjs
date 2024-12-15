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

async function runTest(network = 'testnet') {
  let arlocal;
  try {
    console.log(`Starting Arweave ${network} test...`);
    const connection = await getArweave(network);
    const arweave = network === 'mainnet' ? connection : connection.arweave;
    arlocal = network === 'mainnet' ? null : connection.arlocal;

    // Rest of your original test code here, just keeping the fixed data retrieval
    const wallet = JSON.parse(fs.readFileSync('./arweave-wallet.json'));
    const address = await arweave.wallets.jwkToAddress(wallet);
    
    const balance = await arweave.wallets.getBalance(address);
    const ar = arweave.ar.winstonToAr(balance);
    console.log(`Wallet balance: ${ar} AR`);

    if (network === 'testnet' && balance === '0') {
      await arweave.api.get(`mint/${address}/1000000000000`);
      console.log('Test wallet funded');
    }

    const testData = {
      timestamp: new Date().toISOString(),
      message: `Hello ${network}!`
    };

    console.log('\nUploading test data...');
    const tx = await arweave.createTransaction({
      data: JSON.stringify(testData)
    }, wallet);

    tx.addTag('Content-Type', 'application/json');
    tx.addTag('App-Name', 'ArweaveTest');
    
    await arweave.transactions.sign(tx, wallet);
    await arweave.transactions.post(tx);

    console.log(`\nTransaction ID: ${tx.id}`);

    if (network === 'testnet') {
      console.log('Mining block...');
      await arweave.api.get('mine');
      
      const txData = await arweave.transactions.get(tx.id);
      const data = txData.get('data', { decode: true, string: true });
      console.log('\nRetrieved data:', JSON.parse(data));
      
      if (JSON.parse(data).message === testData.message) {
        console.log('\nTest passed! ✓');
      } else {
        console.log('\nTest failed - data mismatch ✗');
      }
    } else {
      console.log(`View at: https://viewblock.io/arweave/tx/${tx.id}`);
      console.log('Note: Mainnet transactions take 10-30 minutes to confirm');
    }

    if (arlocal) {
      await arlocal.stop();
      console.log('\nLocal test environment stopped');
    }

  } catch (error) {
    console.error('\nTest failed:', error.message);
    if (arlocal) await arlocal.stop();
    process.exit(1);
  }
}

const network = process.argv[2] === 'mainnet' ? 'mainnet' : 'testnet';
runTest(network);