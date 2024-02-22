import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    rollupOptions:{
        output:{
            extend:true
        }
    },
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'license-bb',
      formats:['es','cjs','umd','iife'],
      fileName: 'index',
    },
  },
  plugins: [dts()],
});