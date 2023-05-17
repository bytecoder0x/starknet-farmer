import { Account, CallData } from "starknet";
import { config } from "../config";
import { log } from "../utils/log";
import { randomDelay } from "../utils/delay";
import { fromWei, toUint256 } from "../utils/amount";
import { getAmountOut, swap } from "./swap";
import { getBalance } from "./account";

// half goes to USDC first, pool needs both tokens
export async function addLiquidity(account: Account, amountEthWei: bigint): Promise<string> {
    const router = config.dex.jediswap;
    const eth = config.tokens.ETH;
    const usdc = config.tokens.USDC;
    const half = amountEthWei / 2n;

    const amountUsdc = await getAmountOut("jediswap", eth, usdc, half);
    log.info(`swap ${fromWei(half)} ETH -> USDC on jediswap for liquidity`);
    const swapHash = await swap(account, "jediswap", eth, usdc, half);
    log.success(`tx: ${swapHash}`);
    await randomDelay(config.delayBetweenTx[0], config.delayBetweenTx[1]);

    // pool takes exactly amountBDesired, use what we really got if it is less than the quote
    const balance = config.dryRun ? amountUsdc : await getBalance(account.address, usdc);
    const usdcIn = balance < amountUsdc ? balance : amountUsdc;

    const minRatio = BigInt(Math.round((1 - config.slippage) * 10000));
    const deadline = Math.floor(Date.now() / 1000) + 600;
    const approveEth = {
        contractAddress: eth,
        entrypoint: "approve",
        calldata: CallData.compile({ spender: router, amount: toUint256(half) }),
    };
    const approveUsdc = {
        contractAddress: usdc,
        entrypoint: "approve",
        calldata: CallData.compile({ spender: router, amount: toUint256(usdcIn) }),
    };
    const addCall = {
        contractAddress: router,
        entrypoint: "add_liquidity",
        calldata: CallData.compile({
            tokenA: eth,
            tokenB: usdc,
            amountADesired: toUint256(half),
            amountBDesired: toUint256(usdcIn),
            amountAMin: toUint256(half * minRatio / 10000n),
            amountBMin: toUint256(usdcIn * minRatio / 10000n),
            to: account.address,
            deadline,
        }),
    };

    log.info(`add liquidity ${fromWei(half)} ETH + ${fromWei(usdcIn, 6)} USDC on jediswap`);

    if (config.dryRun) {
        log.info(`dry-run: jediswap add_liquidity calldata: ${addCall.calldata.join(",")}`);

        return "dry-run";
    }

    const { transaction_hash } = await account.execute([approveEth, approveUsdc, addCall]);
    await account.waitForTransaction(transaction_hash);
    log.success(`tx: ${transaction_hash}`);

    return transaction_hash;
}
