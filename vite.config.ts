import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import { fileURLToPath } from 'url';

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
    ],
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'koa',
      appPath: 'src/app.ts',
      exportName: 'app',
    }),
  ],
});
