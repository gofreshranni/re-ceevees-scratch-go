import server from '../dist/server/index.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    return await server.fetch(request);
  } catch (error) {
    console.error('Vercel Edge Router Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
