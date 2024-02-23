import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    rollupOptions:{
        // output:{
        //     extend:true
        // },
        // external: ['module', 'dependencies'],
    },
    lib: {
      entry: resolve(__dirname, 'index.js'),
      name: 'licenseBB',
      formats:['cjs'],
      fileName: 'index',
    },
  },
  plugins: [dts()],
  
});