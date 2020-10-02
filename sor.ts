require('dotenv').config();
const sor = require('@balancer-labs/sor');
const BigNumber = require('bignumber.js');
const ethers = require('ethers');

const MAX_UINT = ethers.constants.MaxUint256;

const tokenIn = '0x1528F3FCc26d13F7079325Fb78D9442607781c8C';      // DAI KOVAN
const tokenOut = '0xd0A1E359811322d97991E03f863a0C30C2cF029C';       // WETH KOVAN
const proxyAddr = '0x4e67bf5bD28Dd4b570FBAFe11D0633eCbA2754Ec';

(async function(){
  const amtIn = new BigNumber('10000000000000000000');

  const pools = await sor.getPoolsWithTokens(tokenIn, tokenOut);

  if(pools.pools.length === 0){
    console.log('No pools');
    return;
  }

  console.log('Pools Retrieved.');

  const poolData = sor.parsePoolData(pools.pools, tokenIn, tokenOut);

  const sorSwaps = sor.smartOrderRouter(
    poolData,
    'swapExactIn',
    amtIn,
    new BigNumber('4'),
    0
  );

  const swapsFormatted = sor.formatSwapsExactAmountIn(sorSwaps, MAX_UINT, 0);

  // Create correct swap format for new proxy
  let swaps = [];
  for (let i = 0; i < swapsFormatted.length; i++) {
      let swap = {
          pool: swapsFormatted[i].pool,
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          swapAmount: swapsFormatted[i].tokenInParam,
          limitReturnAmount: swapsFormatted[i].tokenOutParam,
          maxPrice: swapsFormatted[i].maxPrice.toString(),
      };
      swaps.push(swap);
  }

  const expectedOut = sor.calcTotalOutput(swapsFormatted, poolData);

  const provider = new ethers.providers.JsonRpcProvider(
      `https://kovan.infura.io/v3/${process.env.INFURA}` // If running this example make sure you have a .env file saved in root DIR with INFURA=your_key
  );

  let wallet = new ethers.Wallet(process.env.KEYKOVAN, provider);

  const proxyArtifact = require('./ExchangeProxy.json');
  const proxyAbi = proxyArtifact.abi;

  let proxyContract = new ethers.Contract(proxyAddr, proxyAbi, provider);
  proxyContract = proxyContract.connect(wallet);

  const tokenArtifact = require('./TToken.json');
  let tokenInContract = new ethers.Contract(tokenIn, tokenArtifact.abi, provider);
  let tx;
  tokenInContract = tokenInContract.connect(wallet);

  console.log('Approving proxy...');
  tx = await tokenInContract.approve(proxyAddr, MAX_UINT);
  await tx.wait();
  console.log('Approved')

  console.log('swapping...');

  let owner = await proxyContract.owner();
  console.log(owner)

  tx = await proxyContract.batchSwapExactIn(
        swaps,
        tokenIn,
        tokenOut,
        amtIn.toString(),
        0, {
            gasPrice: 10000000000,
            gasLimit: 12000000
        }
    );

  console.log(`Tx Hash: ${tx.hash}`);
  await tx.wait();
  // Example hash: 0x4de4e521da85fd88f7cef2adee76a08cbfcfad9651197fe17e90ec00b1e544fa

  console.log('Check Balances');
})()
