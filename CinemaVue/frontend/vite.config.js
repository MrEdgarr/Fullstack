import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

//plugin
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import svgLoader from 'vite-svg-loader'

//tailwind
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    AutoImport({
      // Tự động import các hàm của vue, vue-router, pinia...
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts', // Tạo file định nghĩa type tự động (cho TypeScript)
    }),
    Components({
      // Tự động import component trong thư mục src/components
      dirs: ['src/components'],
      extensions: ['vue', 'svg'],
      include: [/\.vue$/, /\.vue\?vue/, /\.svg$/],
      dts: 'src/components.d.ts', // Tạo file định nghĩa type cho component
      // directoryAsNamespace: false,
    }),
    svgLoader({
      defaultImport: 'component',
      svgoConfig: {
        plugins: [
          // Quan trọng: Xóa fill/stroke cứng trong file SVG để CSS có thể override màu
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false, // Giữ lại viewBox để scale đúng
              },
            },
          },
          'removeDimensions', // Xóa width/height cứng để Tailwind điều khiển
          {
            name: 'removeAttrs',
            params: {
              attrs: '(fill|stroke)', // Xóa mọi thuộc tính màu cứng
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
