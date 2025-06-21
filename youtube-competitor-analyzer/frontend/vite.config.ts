import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    
    // Define process.env for client-side access
    define: {
      'process.env': JSON.stringify(env),
      'process.env.VITE_YOUTUBE_API_KEY': JSON.stringify(env.VITE_YOUTUBE_API_KEY)
    },
    
    // Alternative: Just define process as empty object
    // define: {
    //   'process.env': {}
    // }
  }
})
