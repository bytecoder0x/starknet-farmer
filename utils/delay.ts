import { log } from "./log";

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const randomDelay = async (minSec: number, maxSec: number) => {
    const seconds = Math.floor(Math.random() * (maxSec - minSec + 1)) + minSec;
    log.info(`waiting ${seconds}s`);
    await sleep(seconds * 1000);
};
