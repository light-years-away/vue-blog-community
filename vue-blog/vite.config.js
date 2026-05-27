/*
 * @Author: 
 * @Date: 2026-03-11 14:25:55
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2026-05-18 00:22:05
 * @Description: 
 * @FilePath: \vue-blog\vite.config.js
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'
import VueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
//自动导入插件
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { VantResolver } from '@vant/auto-import-resolver'

import { visualizer } from 'rollup-plugin-visualizer'

import importToCDN from 'vite-plugin-cdn-import'

// https://vite.dev/config/
export default defineConfig({
  base: './',  //确保资源是相对路径
  build: {
    // 开启 Vite 的 modulepreload 自动注入（默认 true）
    // 静态导入的 chunk 会自动加 <link rel=”modulepreload”>
    modulePreload: {
      polyfill: true, // 为不支持 modulepreload 的浏览器降级
    },
    rollupOptions: {
      //  外置”纯 JS 可走 ESM CDN 的库”，让 dist 里不再把它们打包进去。
      // 说明：Vite 默认打包产物是 ESM，所以这里用 output.paths 把裸模块名重写为 CDN 的 ESM 地址。
      external: [
        'axios',
        'qs',
        'node-forge',
        '@wangeditor/editor',

      ],
      output: {
        // 将大库拆为独立 chunk，实现并行下载 + 长期缓存
        // 注意：不设 catch-all，让 Rollup 自然分配：
        //   - 静态依赖 → 入口 chunk 或 vendor-chunk
        //   - 动态依赖（Vant）→ 懒加载 chunk，不预加载
        manualChunks(id) {
          if (id.includes('node_modules/element-plus')) return 'vendor-element';
          if (id.includes('node_modules/vue')) return 'vendor-vue';
          if (id.includes('node_modules/socket.io-client') || id.includes('node_modules/engine.io-client')) return 'vendor-socket';
          if (id.includes('node_modules/lodash-es')) return 'vendor-lodash';
        },
        paths: {//将 import 语句中的 “包名” 替换成 “CDN 网址”
          // axios 本身就提供 ESM 构建
          axios: 'https://cdn.jsdelivr.net/npm/axios@1.13.6/dist/esm/axios.min.js',

          // qs / node-forge / wangeditor：用 esm.sh 提供稳定的 ESM 封装（原包不一定有浏览器 ESM 版本）

          /*
          esm.sh
          自动转换格式：哪怕原包是 CommonJS，它也能在服务器端实时把它转换成 ESM 格式。
          自动填充依赖：如果原包依赖了 Node.js 的内置模块（如 Buffer），esm.sh 会自动注入浏览器版的 polyfill（垫片），让代码能跑通。
          极简 URL：你不需要去查这个包的具体文件路径，只要写 https://esm.sh/包名 就行，它会自动处理。

          */
          qs: 'https://esm.sh/qs@6.13.0',
          'node-forge': 'https://esm.sh/node-forge@1.3.3',
          '@wangeditor/editor': 'https://esm.sh/@wangeditor/editor@5.1.23',

        },
      },
    }
  },
  plugins: [
    vue(),

    VueDevTools(),//vue开发者工具
    // 自动导入 API + 组件
    AutoImport({//自动导入 API（如 ref/reactive 等）
      resolvers: [
        ElementPlusResolver(),
        VantResolver({ importStyle: false }), // CSS 手动管理（随移动端路由按需加载）
      ],
    }),
    Components({// 自动导入组件
      resolvers: [
        ElementPlusResolver(),
        VantResolver({ importStyle: false }), // CSS 手动管理
      ],
    }),

    //添加分析插件（只在执行 build 时生成报告）
    visualizer({
      open: true,  // 打包完成后自动打开浏览器
      filename: 'dist/stats.html', // 生成的分析报告文件名
      gzipSize: true,    // 显示 gzip 压缩后的大小
      brotliSize: true,  // 显示 brotli 压缩后的大小
    }),

    // 自定义插件：为懒加载的 Editor chunk 添加 modulepreload
    // 原理：Vite 默认只给静态 import 的模块加 modulepreload，
    // 动态 import() 的懒加载 chunk 需要手动声明预加载。
    // 使用 closeBundle 在构建写入完成后，直接修改 dist/index.html
    {
      name: 'inject-editor-preload',
      apply: 'build',
      closeBundle() {
        const assetsDir = path.resolve(__dirname, 'dist/assets');
        const htmlPath = path.resolve(__dirname, 'dist/index.html');
        if (!fs.existsSync(htmlPath) || !fs.existsSync(assetsDir)) return;

        const files = fs.readdirSync(assetsDir);
        const editorChunk = files.find((f) => /^Editor-\w+\.js$/.test(f));
        if (!editorChunk) return;

        let html = fs.readFileSync(htmlPath, 'utf-8');
        const link = `  <link rel="modulepreload" crossorigin href="./assets/${editorChunk}">`;
        if (html.includes(link)) return; // 幂等，避免重复注入

        html = html.replace('</head>', `${link}\n  </head>`);
        fs.writeFileSync(htmlPath, html);
        console.log(`  ✔ modulepreload for Editor → ./assets/${editorChunk}`);
      },
    },
  ],
  server: {
    host: '0.0.0.0', // 绑定所有网卡，允许局域网访问
    port: 5173 // 保持和当前端口一致
  },
  //别名配置
  resolve: {
    alias: {
      //键：别名  值：真实路径
      '@': path.resolve(__dirname, 'src'),
      'assets': path.resolve(__dirname, 'src/assets'),
      'components': path.resolve(__dirname, 'src/components'),
      'views': path.resolve(__dirname, 'src/views')
    }
  },
  //移动端适配
  css: {
    postcss: {
    }
  }
})
