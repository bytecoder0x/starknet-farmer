import { ethers } from "ethers";
import { config } from "../config";
import { log } from "../utils/log";

const STARKGATE_ABI = ["function deposit(uint256 amount, uint256 l2Recipient) payable"];

export async function bridgeToStarknet(l2Address: string, amountEth: number): Promise<string> {
    const amountWei = ethers.utils.parseEther(amountEth.toString());
    const feeWei = ethers.utils.parseEther(config.l1MessageFeeEth.toString());
    // msg.value = amount + fee for the L1->L2 message
    const value = amountWei.add(feeWei);

    log.info(`bridge ${amountEth} ETH -> ${l2Address} via StarkGate, fee ${config.l1MessageFeeEth} ETH`);

    if (config.dryRun) {
        log.warn(`dry-run: ${config.starkgateL1} deposit(${amountWei.toString()}, ${l2Address}) value ${ethers.utils.formatEther(value)} ETH`);

        return "dry-run";
    }

    if (!config.l1.privateKey) {
        throw new Error("L1_PRIVATE_KEY is empty");
    }

    const provider = new ethers.providers.JsonRpcProvider(config.l1.rpcUrl);
    const wallet = new ethers.Wallet(config.l1.privateKey, provider);
    const starkgate = new ethers.Contract(config.starkgateL1, STARKGATE_ABI, wallet);

    const tx = await starkgate.deposit(amountWei, l2Address, { value });
    log.info(`tx: ${tx.hash}`);
    await tx.wait();

    return tx.hash;
}
