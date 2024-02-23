import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    rollupOptions:{
        output:{
            extend:true
        },
        external: ['module', 'dependencies'],
    },
    lib: {
      entry: resolve(__dirname, 'lib/index.ts'),
      name: 'licenseBB',
      formats:['cjs','umd'],
      fileName: 'index',
    },
  },
  plugins: [dts()],
  
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
});