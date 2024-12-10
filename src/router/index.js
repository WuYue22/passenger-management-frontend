import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import RegisterView from "@/views/RegisterView.vue"; // 假设有一个信息界面

const routes = [
  { path: "/", component: RegisterView },
  { path: "/dashboard", component: DashboardView },
  { path: "/login", component: LoginView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
