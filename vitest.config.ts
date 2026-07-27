import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@cansche/shared': path.resolve(__dirname, './packages/shared/src/index.ts'),
      '@cansche/domain': path.resolve(__dirname, './packages/domain/src/index.ts'),
      '@cansche/selection': path.resolve(__dirname, './packages/selection/src/index.ts'),
      '@cansche/engine': path.resolve(__dirname, './packages/engine/src/index.ts'),
      '@cansche/api': path.resolve(__dirname, './packages/api/src/index.ts'),
      '@cansche/storage': path.resolve(__dirname, './packages/storage/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
