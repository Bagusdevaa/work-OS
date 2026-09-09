/** "1 task" / "3 tasks", with an optional irregular plural. */
export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
	return `${count} ${count === 1 ? singular : plural}`;
}
