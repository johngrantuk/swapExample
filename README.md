Include following info in a root .env file:
```
INFURA=your_api_key

REACT_APP_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-kovan

KEYKOVAN=your_kovan_acct_pk
```

Run: `$ yarn install`

To make swap run: `$ ts-node sor.ts` (Change tokenIn/Out and amtIn to suit)
