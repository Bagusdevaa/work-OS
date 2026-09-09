import type { InboxKind } from '$lib/types/domain';

export interface ClassifiedCapture {
	kind: InboxKind;
	content: string;
	url: string | null;
}

const URL_PATTERN = /https?:\/\/[^\s<>"']+/i;

/**
 * Guesses what a quick capture is so the user does not have to decide up front.
 * An explicit kind always wins; the URL (if any) is extracted either way.
 */
export function classifyCapture(raw: string, explicitKind?: InboxKind | null): ClassifiedCapture {
	const content = raw.trim();
	const url = content.match(URL_PATTERN)?.[0] ?? null;
	return { kind: explicitKind ?? detectKind(content, url), content, url };
}

function detectKind(content: string, url: string | null): InboxKind {
	if (url) return 'link';
	const lower = content.toLowerCase();
	if (/^remind(er)?\b/.test(lower) || /\bremind me\b/.test(lower)) return 'reminder';
	if (/^idea\b/.test(lower) || /^what if\b/.test(lower) || lower.endsWith('?')) return 'idea';
	if (/^note\b/.test(lower)) return 'note';
	return 'task';
}

/** First line of a capture, shortened for use as a title. */
export function captureTitle(content: string, max = 120): string {
	const firstLine = content.split('\n')[0].trim();
	return firstLine.length > max ? `${firstLine.slice(0, max - 1)}…` : firstLine;
}
