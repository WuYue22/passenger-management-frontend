const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})
// 配置启动端口
module.exports = {
  devServer: {
    client: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 替换为 api-gateway 的实际地址
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  }
}
