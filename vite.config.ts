// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
// Determine the server preset dynamically based on the cloud hosting provider environment
const getPreset = () => {
  if (process.env.VERCEL || process.env.VERCEL_ENV) return "vercel";
  if (process.env.NETLIFY || process.env.NETLIFY_ENV) return "netlify";
  return undefined; // Local fallback
};

export default defineConfig({
  cloudflare: !process.env.VERCEL && !process.env.NETLIFY,
  tanstackStart: {
    server: { 
      entry: "server",
      preset: getPreset()
    },
  },
});
