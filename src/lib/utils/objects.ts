/** Returns a shallow copy of `source` without the given keys. */
export function omitKeys<T extends Record<string, unknown>, K extends keyof T>(
	source: T,
	keys: readonly K[]
): Omit<T, K> {
	const copy = { ...source };
	for (const key of keys) delete copy[key];
	return copy;
}
