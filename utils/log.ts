import chalk from "chalk";

export const log = {
    info(msg: string): void {
        console.log(chalk.cyan(msg));
    },
    success(msg: string): void {
        console.log(chalk.green(msg));
    },
    warn(msg: string): void {
        console.log(chalk.yellow(msg));
    },
    error(msg: string): void {
        console.log(chalk.red(msg));
    },
};

export const walletTag = (index: number) => `[wallet ${index}]`;
