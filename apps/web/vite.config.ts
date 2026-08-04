import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'fs';
import path from 'path';

const tauriConfigPath = path.resolve(__dirname, '../desktop/src-tauri/tauri.conf.json');
const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8')) as { version: string };

export default defineConfig({
  plugins: [vue()],
  define: {
    __CANSCHE_APP_VERSION__: JSON.stringify(tauriConfig.version),
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, '../..')],
    },
  },
  resolve: {
    alias: {
      '@cansche/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@cansche/domain': path.resolve(__dirname, '../../packages/domain/src/index.ts'),
      '@cansche/selection': path.resolve(__dirname, '../../packages/selection/src/index.ts'),
      '@cansche/engine': path.resolve(__dirname, '../../packages/engine/src/index.ts'),
      '@cansche/api': path.resolve(__dirname, '../../packages/api/src/index.ts'),
      '@cansche/storage': path.resolve(__dirname, '../../packages/storage/src/index.ts'),
      '@cansche/platform': path.resolve(__dirname, '../../packages/platform/src/index.ts'),
      '@cansche/repositories': path.resolve(__dirname, '../../packages/repositories/src/index.ts'),
      '@cansche/application': path.resolve(__dirname, '../../packages/application/src/index.ts'),
    },
  },
});
