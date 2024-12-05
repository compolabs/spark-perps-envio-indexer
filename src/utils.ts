import crypto from "node:crypto";

export const getHash = (data: string) => {
	return crypto.createHash("sha256").update(data).digest("hex");
};

export const getISOTime = (timeInSeconds: number) => {
	return new Date(timeInSeconds * 1000).toISOString();
};

export function decodeI64(underlying: bigint): bigint {
	const INDENT_I64 = BigInt("0x8000000000000000");

	if (underlying >= INDENT_I64) {
		return underlying - INDENT_I64;
	} else {
		return -(INDENT_I64 - underlying);
	}
}
