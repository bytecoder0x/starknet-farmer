import { Account, CallData, RpcProvider, SequencerProvider, ec, hash } from "starknet";
import { config } from "../config";

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
