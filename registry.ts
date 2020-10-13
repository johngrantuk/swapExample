require('dotenv').config();
const ethers = require('ethers');

const proxyAddr = '0x4e67bf5bD28Dd4b570FBAFe11D0633eCbA2754Ec';
const RegistryAddr = '0xC5570FC7C828A8400605e9843106aBD675006093';

(async function(){
  const provider = new ethers.providers.JsonRpcProvider(
      `https://kovan.infura.io/v3/${process.env.INFURA}` // If running this example make sure you have a .env file saved in root DIR with INFURA=your_key
  );

  let wallet = new ethers.Wallet(process.env.KEYKOVAN, provider);

  const proxyArtifact = require('./ExchangeProxy.json');
  const proxyAbi = proxyArtifact.abi;

  let proxyContract = new ethers.Contract(proxyAddr, proxyAbi, provider);
  proxyContract = proxyContract.connect(wallet);

  console.log('Updating proxy registry...');
  let tx = await proxyContract.setRegistry(RegistryAddr);
  await tx.wait();
  console.log(`Tx Hash: ${tx.hash}`);
  console.log('Done')
})()
