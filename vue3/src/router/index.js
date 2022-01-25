import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/rank",
    name: "Rank",
    component: () => import("@/views/Rank.vue"),
  },
  {
    path: "/message",
    name: "Message",
    component: () => import("@/views/Message.vue"),
  },
  {
    path: "/api",
    name: "Api",
    component: () => import("@/views/Api.vue"),
  },
  {
    path: "/contact",
    name: "Contact",
    component: () => import("@/views/Contact.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
