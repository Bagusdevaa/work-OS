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
				// Must sit beside the Supabase project, which lives in ap-northeast-1 (Tokyo);
				// hnd1 is Vercel's Tokyo region. Confirm with the `x-debug-db` header, which
				// reports the pooler host the app actually dials — guessing the region from
				// how close the Supabase API *feels* is wrong, because Cloudflare terminates
				// TLS at an edge near the client, not at the database.
				regions: ['hnd1']
			}),
			typescript: {
				config: (config) => {
					config.include.push('../drizzle.config.ts');
				}
			}
		})
	]
});
