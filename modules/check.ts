import { config } from "../config";
import { fromWei } from "../utils/amount";
import { getArgentAddress, getBalance, getProvider, isDeployed } from "./account";

export type WalletInfo = { index: number; address: string; deployed: boolean; nonce: number; eth: string; usdc: string };

export async function checkWallet(privateKey: string, index: number): Promise<WalletInfo> {
    const provider = getProvider();
    const address = getArgentAddress(privateKey);
    const deployed = await isDeployed(address);
    const nonce = deployed ? Number(await provider.getNonceForAddress(address)) : 0;
    const eth = await getBalance(address, config.tokens.ETH);
    const usdc = await getBalance(address, config.tokens.USDC);

    return { index, address, deployed, nonce, eth: fromWei(eth, 18), usdc: fromWei(usdc, 6) };
}

export const printCheck = (list: WalletInfo[]) => console.table(list);
