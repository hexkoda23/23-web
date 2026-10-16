import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { growthApiPlugin } from './server/dev-api.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['FIREBASE_SERVICE_ACCOUNT', 'SERPAPI_API_KEY', 'SITE_URL', 'CRON_SECRET', 'GROWTH_ADMIN_EMAILS', 'GROWTH_ADMIN_UIDS', 'RESEARCH_DAILY_LIMIT', 'GROWTH_STORAGE_READY']) {
    if (env[key] && !process.env[key]) process.env[key] = env[key];
  }
  return {
  plugins: [react(),tailwindcss(), growthApiPlugin()],
  server: {
    port: 3122,
    strictPort: true,
    host: true
  }
  }
})
