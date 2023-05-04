import fs from "fs";

export function readWallets(file: string): string[] {
    if (!fs.existsSync(file)) {
        throw new Error("wallets.txt not found, copy wallets.example.txt");
    }
    return fs
        .readFileSync(file, "utf8")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"));
}
