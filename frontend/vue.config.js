const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // plugins: [vue()],
    devServer: {
        port: 8081, // your Vue dev server port
        proxy: {
            '/api': {
                target: 'http://localhost:2800',
                changeOrigin: true,
                // pathRewrite: { '^/api': '' },
            },
        },

    },
})