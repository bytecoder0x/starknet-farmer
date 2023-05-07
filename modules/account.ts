import { Account, CallData, RpcProvider, SequencerProvider, ec, hash } from "starknet";
import { config } from "../config";
import { fromUint256 } from "../utils/amount";

let provider: SequencerProvider | RpcProvider | undefined;

export function getProvider(): SequencerProvider | RpcProvider {
    if (!provider) {
        provider = config.starknet.rpcUrl
            ? new RpcProvider({ nodeUrl: config.starknet.rpcUrl })
            : new SequencerProvider({ baseUrl: config.starknet.sequencerUrl });
    }
    return provider;
}

function argentConstructorCalldata(publicKey: string) {
    return CallData.compile({
        implementation: config.argent.accountClassHash,
        selector: hash.getSelectorFromName("initialize"),
        calldata: CallData.compile({ signer: publicKey, guardian: "0" }),
    });
}

export function getArgentAddress(privateKey: string): string {
    const publicKey = ec.starkCurve.getStarkKey(privateKey);
    const address = hash.calculateContractAddressFromHash(
        publicKey,
        config.argent.proxyClassHash,
        argentConstructorCalldata(publicKey),
        0
    );

    return address;
}

export function getAccount(privateKey: string): Account {
    return new Account(getProvider(), getArgentAddress(privateKey), privateKey);
}

export async function isDeployed(address: string): Promise<boolean> {
    try {
        await getProvider().getClassHashAt(address);
        return true;
    } catch {
        return false;
    }
}

export async function getBalance(address: string, token: string): Promise<bigint> {
    const { result } = await getProvider().callContract({
        contractAddress: token,
        entrypoint: "balanceOf",
        calldata: CallData.compile({ account: address }),
    });

    return fromUint256(result[0], result[1]);
}
