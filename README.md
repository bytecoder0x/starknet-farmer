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

## Config

Everything is in `config.ts`: addresses, amount ranges, slippage, delays, which modules to run. With `dryRun: true` nothing is sent, the script just prints what it would send with calldata, good for checking before real run:

```
loaded 1 wallets
dry-run mode, nothing will be sent
[wallet 1] 0x008251cde35ba23b95ce3361ff25240343f3fded47712def70284820362cf997
dry-run: deploy account 0x008251cde35ba23b95ce3361ff25240343f3fded47712def70284820362cf997 with class 0x025ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918
calldata: 1449178161945088530446351771646113898511736767359683664273252560520029776866,215307247182100370520050591091822763712463273430149262739280891880522753123,2,772086562554789838447392187308250269388986311038768032070716410357794609965,0
[wallet 1] deploy account, tx: dry-run
waiting 27s
```

L1 -> L2 message fee is `l1MessageFeeEth` in config, if it is too low the deposit will stuck. Swap back sells all USDC on the wallet, not only what was just bought.
