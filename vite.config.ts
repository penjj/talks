import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? './talks' : '/',
  resolve: {
    alias: {
      '/': './public',
    },
  },
})
