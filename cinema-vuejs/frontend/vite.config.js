// Plugins
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// Utilities
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
//
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// tailwindcss
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueDevTools(),
        tailwindcss(),
        Components({
            dirs: ['src/components'],
            deep: true,
        }),
        AutoImport({
            imports: [
                'vue',
                {
                    pinia: ['defineStore', 'storeToRefs'],
                },
            ],
            eslintrc: {
                enabled: true,
            },
            vueTemplate: true,
        }),
    ],
    optimizeDeps: {
        exclude: ['vue-router'],
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('src', import.meta.url)),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@import "@/styles/tailwind.css`,
            },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Chia các thư viện lớn thành các chunk riêng
                    if (id.includes('node_modules')) {
                        if (id.includes('vue')) {
                            return 'vue'
                        }
                        // Có thể thêm các thư viện khác
                        return 'vendor'
                    }
                },
            },
        },
        // Tối ưu hóa dependency pre-bundling
        commonjsOptions: {
            include: [],
        },
        // Tách CSS ra file riêng
        cssCodeSplit: true,
        // Giảm kích thước bundle
        reportCompressedSize: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
    },
})
