# starknet-farmer

Script for Starknet activity with many wallets, made for retrodrop farming. Takes Argent X private keys from a file, bridges ETH from L1 with StarkGate, deploys the account if it is not deployed yet, then swaps ETH <-> USDC on JediSwap or 10kSwap and adds liquidity. Amounts and pauses are random so wallets don't look the same.

## How to use

```
npm install
cp wallets.example.txt wallets.txt    # one private key per line
cp .env.example .env                  # L1 rpc and key, only needed for bridge

npm run check     # balances and tx count, sends nothing
npm run bridge    # StarkGate deposit to every wallet
npm run farm      # deploy if needed + swaps + liquidity in random order
```

Node 18, starknet.js 5.9, ethers 5.7 only for the L1 part.
