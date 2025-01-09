import { defineConfig } from 'vite'
import Rails from 'vite-plugin-rails'

export default defineConfig(({ mode }) => {
  return {
    plugins: [Rails()],
    resolve: {
      alias: {
        '@': '/app/javascript',
      },
    },
    build: {
      minify: mode === 'production',
      sourcemap: mode === 'development',
    },
  }
})
