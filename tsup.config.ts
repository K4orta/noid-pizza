import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/lib/index.ts'],
  splitting: false,
  sourcemap: true,
  dts: true,
  clean: true,
  format: ['cjs', 'esm'],
});
