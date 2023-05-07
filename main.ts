import { config } from "./config";
import { log, walletTag } from "./utils/log";
import { readWallets } from "./utils/wallets";
import { checkWallet, printCheck, WalletInfo } from "./modules/check";

const command = process.argv[2];

async function check(wallets: string[]) {
    const list: WalletInfo[] = [];

    for (let i = 0; i < wallets.length; i++) {
        try {
            list.push(await checkWallet(wallets[i], i + 1));
        } catch (e) {
            log.error(`${walletTag(i + 1)} ${(e as Error).message}`);
        }
    }
    printCheck(list);
}

async function main() {
    if (command !== "check") {
        console.log("usage: npm run check");
        return;
    }

    const wallets = readWallets(config.walletsFile);
    log.info(`loaded ${wallets.length} wallets`);
    await check(wallets);
}

main().catch((e) => {
    log.error(e.message);
    process.exit(1);
});
