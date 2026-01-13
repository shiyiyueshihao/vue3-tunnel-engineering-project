import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// 按需导入配置
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// 可选：如果需要打包压缩（需要安装 vite-plugin-compression）
// import compression from 'vite-plugin-compression'

export default defineConfig(({ mode }) => {
  // 获取当前环境配置
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vue(),
      vueDevTools(),
      // 1. Element Plus 按需自动导入
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'], // 自动导入 Vue 相关 API
        resolvers: [ElementPlusResolver()],
        dts: 'src/auto-import.d.ts', // 生成类型声明文件
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/components.d.ts',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    // 2. 构建优化配置
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false, // 生产环境关闭 sourcemap
      chunkSizeWarningLimit: 1500, // 提高超大包警告阈值
      rollupOptions: {
        output: {
          // 3. 核心优化：分包策略 (Manual Chunks)
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // 将 TinyMCE 和 ECharts 这种超大库独立打包
              if (id.includes('tinymce')) return 'vendor-tinymce';
              if (id.includes('echarts')) return 'vendor-echarts';
              if (id.includes('element-plus')) return 'vendor-element-plus';
              // 其他公共依赖
              return 'vendor-others';
            }
          },
          // 用于去掉打包后资源名的 hash 值（如果需要固定文件名可配置，通常建议保留 hash 缓存控制）
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
        },
      },
      // 压缩配置
      minify: 'terser', 
      terserOptions: {
        compress: {
          drop_console: true, // 生产环境移除 console
          drop_debugger: true,
        },
      },
    },
    // 4. 开发服务器配置
    server: {
      host: '0.0.0.0', // 允许局域网访问
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000', // 代理到 Express 后端
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})