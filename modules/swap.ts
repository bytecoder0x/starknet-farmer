import { Account, CallData } from "starknet";
import { config } from "../config";
import { log, walletTag } from "../utils/log";
import { fromUint256, randomAmount, toUint256, toWei } from "../utils/amount";
import { getProvider } from "./account";

export async function getAmountOut(tokenIn: string, tokenOut: string, amountIn: bigint): Promise<bigint> {
    if (config.dryRun) {
        return 0n;
    }
    const { result } = await getProvider().callContract({
        contractAddress: config.dex.jediswap,
        entrypoint: "get_amounts_out",
        calldata: CallData.compile({ amountIn: toUint256(amountIn), path: [tokenIn, tokenOut] }),
    });
    // last u256 in result is the amount out
    return fromUint256(result[result.length - 2], result[result.length - 1]);
}

export async function swap(account: Account, tokenIn: string, tokenOut: string, amountIn: bigint): Promise<string> {
    const router = config.dex.jediswap;
    const amountOut = await getAmountOut(tokenIn, tokenOut, amountIn);
    const amountOutMin = amountOut * BigInt(Math.round((1 - config.slippage) * 10000)) / 10000n;
    const deadline = Math.floor(Date.now() / 1000) + 600;

    const approveCall = {
        contractAddress: tokenIn,
        entrypoint: "approve",
        calldata: CallData.compile({ spender: router, amount: toUint256(amountIn) }),
    };
    const swapCall = {
        contractAddress: router,
        entrypoint: "swap_exact_tokens_for_tokens",
        calldata: CallData.compile({
            amountIn: toUint256(amountIn),
            amountOutMin: toUint256(amountOutMin),
            path: [tokenIn, tokenOut],
            to: account.address,
            deadline,
        }),
    };

    if (config.dryRun) {
        log.info(`dry-run: jediswap swap_exact_tokens_for_tokens amountIn ${amountIn}, min out ${amountOutMin}`);
        log.info(`calldata: ${swapCall.calldata.join(",")}`);

        return "dry-run";
    }

    const { transaction_hash } = await account.execute([approveCall, swapCall]);
    await account.waitForTransaction(transaction_hash);

    return transaction_hash;
}

export async function randomSwap(account: Account, index: number): Promise<void> {
    const amountEth = randomAmount(config.swapAmountEth[0], config.swapAmountEth[1]);
    log.info(`${walletTag(index)} swap ${amountEth} ETH -> USDC on jediswap`);
    const hash = await swap(account, config.tokens.ETH, config.tokens.USDC, toWei(amountEth));
    log.success(`${walletTag(index)} tx: ${hash}`);
}
