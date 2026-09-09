import { z } from 'zod';
import { COMPANY_ACCENTS } from '$lib/types/domain';
import { optionalEnum, optionalText, requiredText } from '$lib/utils/schema-helpers';

export const companySchema = z.object({
	name: requiredText(120),
	description: optionalText(2000),
	accent: optionalEnum(COMPANY_ACCENTS)
});
export type CompanyInput = z.output<typeof companySchema>;
