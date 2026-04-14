import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

//plugin
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

//tailwind
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    AutoImport({
      // Tự động import các hàm của vue, vue-router, pinia...
      imports: ["vue", "vue-router", "pinia"],
      dts: "src/auto-imports.d.ts", // Tạo file định nghĩa type tự động (cho TypeScript)
    }),
    Components({
      // Tự động import component trong thư mục src/components
      dirs: ["src/components"],
      deep: true,
      extensions: ["vue", "svg"],
      include: [/\.vue$/, /\.vue\?vue/, /\.svg$/],
      dts: "src/components.d.ts", // Tạo file định nghĩa type cho component
      // directoryAsNamespace: false,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "es2022", // hoặc 'esnext' → bỏ code legacy, build nhanh hơn
    minify: "esbuild", // Rolldown dùng Oxc/esbuild minifier cực nhanh
    cssMinify: "lightningcss", // mặc định trong Vite 8, nhanh hơn PostCSS
    reportCompressedSize: false, // tắt nếu không cần, tiết kiệm ~0.5-1s
    chunkSizeWarningLimit: 1000, // tránh warning không cần thiết
  },
  // Tùy chọn nâng cao (nếu dự án lớn dần)
  optimizeDeps: {
    include: ["vue"], // pre-bundle nhanh hơn
  },
});
