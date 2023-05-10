import { uint256 } from "starknet";

export const toWei = (eth: number) => BigInt(Math.round(eth * 1e18));

export function fromWei(wei: bigint, decimals: number = 18): string {
    const str = wei.toString().padStart(decimals + 1, "0");
    const whole = str.slice(0, str.length - decimals);
    const frac = str.slice(str.length - decimals).replace(/0+$/, "");
    return frac ? whole + "." + frac : whole;
}

export const randomAmount = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(4));

// calldata wants decimal strings
export function toUint256(value: bigint): { low: string; high: string } {
    const u = uint256.bnToUint256(value);
    return { low: BigInt(u.low).toString(), high: BigInt(u.high).toString() };
}

export function fromUint256(low: string, high: string): bigint {
    return uint256.uint256ToBN({ low, high });
}
