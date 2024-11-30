import crypto from "node:crypto";

export const getHash = (data: string) => {
	return crypto.createHash("sha256").update(data).digest("hex");
};

export const getISOTime = (timeInSeconds: number) => {
	return new Date(timeInSeconds * 1000).toISOString();
};

export function decodeI64(underlying: bigint): bigint {
	// Проверяем старший (63-й) бит
	const isNegative = (underlying & (1n << 63n)) !== 0n;

	// Извлекаем абсолютное значение (младшие 63 бита)
	const absValue = underlying & ~(1n << 63n);

	// Возвращаем результат с учетом знака
	return isNegative ? -absValue : absValue;
}
