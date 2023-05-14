import { Account, CallData } from "starknet";
import { config } from "../config";
import { log, walletTag } from "../utils/log";
import { fromUint256, fromWei, randomAmount, toUint256, toWei } from "../utils/amount";
import { getProvider } from "./account";

export type Dex = "jediswap" | "tenkswap";

// 10kSwap router is a JediSwap clone but its functions are camelCase
const entrypoints = {
    jediswap: { amountsOut: "get_amounts_out", swap: "swap_exact_tokens_for_tokens" },
    tenkswap: { amountsOut: "getAmountsOut", swap: "swapExactTokensForTokens" },
};

const tokenInfo: { [address: string]: { symbol: string; decimals: number } } = {
    [config.tokens.ETH]: { symbol: "ETH", decimals: 18 },
    [config.tokens.USDC]: { symbol: "USDC", decimals: 6 },
    [config.tokens.USDT]: { symbol: "USDT", decimals: 6 },
};

const formatAmount = (token: string, amount: bigint) => `${fromWei(amount, tokenInfo[token].decimals)} ${tokenInfo[token].symbol}`;

export async function getAmountOut(dex: Dex, tokenIn: string, tokenOut: string, amountIn: bigint): Promise<bigint> {
    if (config.dryRun) {
        return 0n;
    }
    const { result } = await getProvider().callContract({
        contractAddress: config.dex[dex],
        entrypoint: entrypoints[dex].amountsOut,
        calldata: CallData.compile({ amountIn: toUint256(amountIn), path: [tokenIn, tokenOut] }),
    });
    // last u256 in result is the amount out
    return fromUint256(result[result.length - 2], result[result.length - 1]);
}

export async function swap(account: Account, dex: Dex, tokenIn: string, tokenOut: string, amountIn: bigint): Promise<string> {
    const router = config.dex[dex];
    const amountOut = await getAmountOut(dex, tokenIn, tokenOut, amountIn);
    const amountOutMin = amountOut * BigInt(Math.round((1 - config.slippage) * 10000)) / 10000n;
    const deadline = Math.floor(Date.now() / 1000) + 600;

    const approveCall = {
        contractAddress: tokenIn,
        entrypoint: "approve",
        calldata: CallData.compile({ spender: router, amount: toUint256(amountIn) }),
    };
    const swapCall = {
        contractAddress: router,
        entrypoint: entrypoints[dex].swap,
        calldata: CallData.compile({
            amountIn: toUint256(amountIn),
            amountOutMin: toUint256(amountOutMin),
            path: [tokenIn, tokenOut],
            to: account.address,
            deadline,
        }),
    };

    if (config.dryRun) {
        log.info(`dry-run: ${dex} ${swapCall.entrypoint} ${formatAmount(tokenIn, amountIn)} -> ${tokenInfo[tokenOut].symbol}, min out ${formatAmount(tokenOut, amountOutMin)}`);
        log.info(`calldata: ${swapCall.calldata.join(",")}`);

        return "dry-run";
    }

    const { transaction_hash } = await account.execute([approveCall, swapCall]);
    await account.waitForTransaction(transaction_hash);

    return transaction_hash;
}

export async function randomSwap(account: Account, index: number): Promise<void> {
    const dex: Dex = Math.random() < 0.5 ? "jediswap" : "tenkswap";
    const amountEth = randomAmount(config.swapAmountEth[0], config.swapAmountEth[1]);
    log.info(`${walletTag(index)} swap ${amountEth} ETH -> USDC on ${dex}`);
    const hash = await swap(account, dex, config.tokens.ETH, config.tokens.USDC, toWei(amountEth));
    log.success(`${walletTag(index)} tx: ${hash}`);
}
