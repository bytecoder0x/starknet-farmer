import { uint256 } from "starknet";

export function fromWei(wei: bigint, decimals: number = 18): string {
    const str = wei.toString().padStart(decimals + 1, "0");
    const whole = str.slice(0, str.length - decimals);
    const frac = str.slice(str.length - decimals).replace(/0+$/, "");
    return frac ? whole + "." + frac : whole;
}

export function fromUint256(low: string, high: string): bigint {
    return uint256.uint256ToBN({ low, high });
}
