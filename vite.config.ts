import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				// Pinned so the build does not depend on whatever Node the machine happens to run.
				runtime: 'nodejs24.x',
				// Must sit beside the Supabase project (ap-southeast-1). Vercel otherwise defaults to
				// iad1, putting every query a Pacific round-trip away from the database.
				regions: ['sin1']
			}),
			typescript: {
				config: (config) => {
					config.include.push('../drizzle.config.ts');
				}
			}
		})
	]
});
