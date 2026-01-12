import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'wxt'
import { APP_NAME } from './src/lib/constants'

export default defineConfig({
  srcDir: 'src',
  publicDir: 'public',
  outDir: 'dist',
  modules: ['@wxt-dev/module-svelte'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: APP_NAME,
    description: 'Customize websites with scripts, styles, and CSP management',
    permissions: ['storage', 'tabs', 'scripting', 'declarativeNetRequest'],
    host_permissions: ['<all_urls>'],
    icons: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
    action: {
      default_icon: {
        16: 'icons/icon-16.png',
        32: 'icons/icon-32.png',
        48: 'icons/icon-48.png',
        128: 'icons/icon-128.png',
      },
    },
    options_page: 'editor.html',
  },
})
