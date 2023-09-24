import { defineConfig } from 'vite'

export default defineConfig({
  base: 'talks',
  build: {
    rollupOptions: {
      external: [/^\/.*(\.svg|.gif)$/],
    },
  },
})
