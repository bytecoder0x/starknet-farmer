import "dotenv/config";

export const config = {
    starknet: { sequencerUrl: "https://alpha-mainnet.starknet.io", rpcUrl: process.env.STARKNET_RPC_URL || "" },
    l1: { rpcUrl: process.env.L1_RPC_URL || "", privateKey: process.env.L1_PRIVATE_KEY || "" },
    walletsFile: "wallets.txt",
    tokens: {
        ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        USDC: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        USDT: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
    },
    dex: {
        jediswap: "0x041fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023",
        tenkswap: "0x07a6f98c03379b9513ca84cca1373ff452a7462a3b61598f0af5bb27ad7f76d1",
    },
    starkgateL1: "0xae0ee0a63a2ce6baeeffe56e7714fb4efe48d419",
    argent: {
        proxyClassHash: "0x025ec026985a3bf9d0cc1fe17326b245dfdc3ff89b8fde106542a3ea56c5a918",
        accountClassHash: "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2",
    },
    bridgeAmountEth: [0.01, 0.02],
    l1MessageFeeEth: 0.0005,
    swapAmountEth: [0.001, 0.003],
    slippage: 0.01,                     // 1%
    liquidityAmountEth: [0.002, 0.004],
    delayBetweenWallets: [60, 180],     // seconds
    delayBetweenTx: [15, 45],
    modules: { swap: true, liquidity: true, swapBack: true },
    deployIfNeeded: true,
    dryRun: false,                      // only print, nothing is sent
};
