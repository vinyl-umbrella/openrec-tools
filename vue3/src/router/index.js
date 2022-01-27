import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: "masaoroid",
      desc: "布団ちゃんがオープンチャット(おぷちゃ)で発言した内容を元に作られたAI、masaoroid",
      h2: "Masaoroid",
    },
  },
  {
    path: "/rank",
    name: "Rank",
    component: () => import("@/views/Rank.vue"),
    meta: {
      title: "rank",
      desc: "布団ちゃん オープンチャット(おぷちゃ)書き込み数ランキング",
      h2: "おぷちゃ書き込み数ランキング",
    },
  },
  {
    path: "/message",
    name: "Message",
    component: () => import("@/views/Message.vue"),
    meta: {
      title: "Explore Messages",
      desc: "布団ちゃんオープンチャット(おぷちゃ)過去ログ検索システム",
      h2: "布団ちゃん おぷちゃ過去ログ検索システム",
    },
  },
  {
    path: "/chat",
    name: "Chat",
    component: () => import("@/views/Chat.vue"),
    meta: {
      title: "chat",
      desc: "OPENREC.tv 多機能コメントビューア",
      h2: "OPENREC.tv 多機能コメビュ",
    },
  },
  {
    path: "/stream",
    name: "Stream",
    component: () => import("@/views/Stream.vue"),
    meta: {
      title: "stream",
      desc: "OPENREC.tv 多機能コメントビューア",
      h2: "OPENREC.tv 多機能コメビュ",
    },
  },
  {
    path: "/api",
    name: "Api",
    component: () => import("@/views/Api.vue"),
    meta: {
      title: "Player",
      desc: "OPENREC.tv ニコ生風コメント付きプレイヤー",
      h2: "OPENREC.tv コメ付きプレイヤー",
    },
  },
  {
    path: "/contact",
    name: "Contact",
    component: () => import("@/views/Contact.vue"),
    meta: {
      title: "Contact",
      desc: "要望、連絡先などのお問い合わせフォーム。google formからお願いします。",
      h2: "Contact",
    },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});
const DEFAULT_TITLE = "futonchan-tools";
router.afterEach((to) => {
  if (document.getElementById("pagetitle")) {
    document.getElementById("pagetitle").innerText = to.meta.h2;
  }
  document.title = to.meta.title + " - " + DEFAULT_TITLE || DEFAULT_TITLE;
  document
    .querySelector("meta[name='description']")
    .setAttribute("content", to.meta.desc);
});

export default router;
