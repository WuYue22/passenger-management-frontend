import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from "axios";

//createApp(App).use(store).use(router).mount('#app')

axios.defaults.baseURL = "http://localhost:9999"; // 替换为后端服务的实际地址

const app = createApp(App);
app.use(store).use(router).mount('#app');
app.config.globalProperties.$axios = axios; // 注册全局 axios 实例
//app.mount("#app");
