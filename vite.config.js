import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [AntDesignVueResolver({ importStyle: false })],
    }),
  ],
  build: {
    target: 'esnext',
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue'],
          antd: ['ant-design-vue'],
        },
      },
    },
  },
});
