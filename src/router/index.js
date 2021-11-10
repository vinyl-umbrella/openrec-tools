import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: 'masaoroid',
      desc: '布団ちゃんがオプチャで発言した内容を元に作られたAI。masaoroid',
      h2: 'Masaoroid'
    }
  },
  {
    path: '/rank',
    name: 'Rank',
    component: () => import('../views/Rank.vue'),
    meta: {
      title: 'rank',
      desc: '布団ちゃん オプチャ書き込み数ランキング',
      h2: 'おぷちゃ書き込み数ランキング'
    }
  },
  {
    path: '/message',
    name: 'Message',
    component: () => import('../views/Message.vue'),
    meta: {
      title: 'Explore Messages',
      desc: '布団ちゃんオプチャ過去ログ検索システム',
      h2: '布団ちゃん おぷちゃ過去ログ検索システム'
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: {
      title: 'Chat',
      desc: 'OPENREC.tv 多機能コメントビューア',
      h2: 'OPENREC.tv 多機能コメビュ'
    }
  },
  {
    path: '/stream',
    name: 'Stream',
    component: () => import('../views/Stream.vue'),
    meta: {
      title: 'Player',
      desc: 'OPENREC.tv ニコ生風コメント付きプレイヤー',
      h2: 'OPENREC.tv コメ付きプレイヤー'
    }
  },
  {
    path: '/api',
    name: 'API',
    component: () => import('../views/API.vue'),
    meta: {
      title: 'OPENREC.tv API',
      desc: 'OPENREC.tv API まとめ',
      h2: 'OPENREC.tv API まとめ'
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/Contact.vue'),
    meta: {
      title: 'Contact',
      desc: '要望、連絡先などのお問い合わせフォーム。google formからお願いします。',
      h2: 'Contact'
    }
  },
]

const DEFAULT_TITLE = 'futon-openchat'
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
router.afterEach((to) => {
  if (document.getElementById("pagetitle")) {
    document.getElementById("pagetitle").innerText = to.meta.h2;
  }
  document.title = to.meta.title + ' - ' + DEFAULT_TITLE || DEFAULT_TITLE;
  document.querySelector("meta[name='description']").setAttribute('content', to.meta.desc);
})

export default router
