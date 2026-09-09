/**
 * Returns `next` only when it is a same-origin absolute path, otherwise `fallback`.
 * Prevents open redirects via `?next=`.
 */
export function safeRedirectPath(next: string | null | undefined, fallback = '/'): string {
	if (!next) return fallback;
	if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return fallback;
	return next;
}
