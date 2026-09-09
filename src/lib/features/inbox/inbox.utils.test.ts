import { describe, expect, test } from 'bun:test';
import { classifyCapture } from '$lib/features/inbox/inbox.utils';

describe('classifyCapture', () => {
	test('a bare URL becomes a link with the URL extracted', () => {
		expect(classifyCapture('https://example.com/docs')).toEqual({
			kind: 'link',
			content: 'https://example.com/docs',
			url: 'https://example.com/docs'
		});
	});

	test('text containing a URL keeps the text and extracts the first URL', () => {
		expect(classifyCapture('Read this later https://example.com/a and http://b.io')).toEqual({
			kind: 'link',
			content: 'Read this later https://example.com/a and http://b.io',
			url: 'https://example.com/a'
		});
	});

	test('a question or "idea:" prefix is an idea', () => {
		expect(classifyCapture('Idea: weekly digest email').kind).toBe('idea');
		expect(classifyCapture('What if we cached the scraper output?').kind).toBe('idea');
	});

	test('a "remind" phrasing is a reminder', () => {
		expect(classifyCapture('Remind me to renew the domain').kind).toBe('reminder');
	});

	test('anything else defaults to a task with no url', () => {
		expect(classifyCapture('Call the vendor')).toEqual({
			kind: 'task',
			content: 'Call the vendor',
			url: null
		});
	});

	test('an explicit kind overrides detection', () => {
		expect(classifyCapture('https://example.com', 'note').kind).toBe('note');
	});

	test('trims whitespace', () => {
		expect(classifyCapture('  tidy  ').content).toBe('tidy');
	});
});
