import { config } from "./config";
import { log, walletTag } from "./utils/log";
import { randomDelay } from "./utils/delay";
import { readWallets } from "./utils/wallets";
import { toWei, randomAmount } from "./utils/amount";
import { getArgentAddress, getAccount, isDeployed, deployAccount } from "./modules/account";
import { randomSwap } from "./modules/swap";
import { addLiquidity } from "./modules/liquidity";
import { checkWallet, printCheck, WalletInfo } from "./modules/check";
import { bridgeToStarknet } from "./modules/bridge";

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

async function bridge(wallets: string[]) {
    for (let i = 0; i < wallets.length; i++) {
        const tag = walletTag(i + 1);

        try {
            const address = getArgentAddress(wallets[i]);
            const amount = randomAmount(config.bridgeAmountEth[0], config.bridgeAmountEth[1]);
            const hash = await bridgeToStarknet(address, amount);
            log.success(`${tag} bridge done, tx: ${hash}`);
        } catch (e) {
            log.error(`${tag} ${(e as Error).message}`);
        }

        if (i < wallets.length - 1) {
            await randomDelay(config.delayBetweenWallets[0], config.delayBetweenWallets[1]);
        }
    }
}

async function farm(wallets: string[]) {
    let ok = 0;
    let failed = 0;

    for (let i = 0; i < wallets.length; i++) {
        const tag = walletTag(i + 1);

        try {
            const account = getAccount(wallets[i]);
            log.info(`${tag} ${account.address}`);
            if (config.deployIfNeeded && !(await isDeployed(account.address))) {
                const hash = await deployAccount(wallets[i]);
                log.success(`${tag} deploy account, tx: ${hash}`);
                await randomDelay(config.delayBetweenTx[0], config.delayBetweenTx[1]);
            }

            const steps: string[] = [];
            if (config.modules.swap) steps.push("swap");
            if (config.modules.liquidity) steps.push("liquidity");
            steps.sort(() => Math.random() - 0.5);

            for (const step of steps) {
                if (step === "swap") {
                    await randomSwap(account, i + 1);
                } else {
                    const amount = randomAmount(config.liquidityAmountEth[0], config.liquidityAmountEth[1]);
                    const hash = await addLiquidity(account, toWei(amount));
                    log.success(`${tag} liquidity done, tx: ${hash}`);
                }
                await randomDelay(config.delayBetweenTx[0], config.delayBetweenTx[1]);
            }
            ok++;
        } catch (e) {
            failed++;
            log.error(`${tag} ${(e as Error).message}`);
        }

        if (i < wallets.length - 1) {
            await randomDelay(config.delayBetweenWallets[0], config.delayBetweenWallets[1]);
        }
    }
    log.info(`done: ${ok} ok, ${failed} failed`);
}

async function main() {
    if (command !== "check" && command !== "farm" && command !== "bridge") {
        console.log("usage: npm run check | farm | bridge");
        return;
    }

    const wallets = readWallets(config.walletsFile);
    log.info(`loaded ${wallets.length} wallets`);

    if (config.dryRun) {
        log.warn("dry-run mode, nothing will be sent");
    }

    if (command === "check") await check(wallets);

    if (command === "bridge") await bridge(wallets);

    if (command === "farm") await farm(wallets);
}

main().catch((e) => {
    log.error(e.message);
    process.exit(1);
});
