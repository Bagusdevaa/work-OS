import { z } from 'zod';
import { optionalText } from '$lib/utils/schema-helpers';

export const reviewSchema = z.object({
	wins: optionalText(5000),
	problems: optionalText(5000),
	lessons: optionalText(5000),
	nextWeekPriorities: optionalText(5000)
});
export type ReviewInput = z.output<typeof reviewSchema>;
