// The SSR bundle is generated during `vite build`, so TypeScript cannot see it
// before the build output exists in Vercel's type-check step.
// @ts-expect-error - generated production bundle has no declaration file
import server from '../dist/server/index.js';

export default {
  async fetch(request: Request) {
  try {
    return await server.fetch(request);
  } catch (error) {
    console.error('Vercel Router Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
  },
};
