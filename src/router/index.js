import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'masaoroid',
      desc: '布団ちゃんがオプチャで発言した内容を元に作られたAI。masaoroid'
    }
  },
  {
    path: '/rank',
    name: 'Rank',
    component: () => import('../views/Rank.vue'),
    meta: {
      title: 'rank',
      desc: '布団ちゃん オプチャ書き込み数ランキング'
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/Contact.vue'),
    meta: {
      title: 'Contact',
      desc: '要望、連絡先などのお問い合わせフォーム。google formからお願いします。'
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: {
      title: 'Chat',
      desc: 'OPENREC.tv 高機能コメントビューア'
    }
  },
  {
    path: '/message',
    name: 'Message',
    component: () => import('../views/Message.vue'),
    meta: {
      title: 'Explore Messages',
      desc: '布団ちゃんオプチャ過去ログ検索システム'
    }
  },
  {
    path: '/stream',
    name: 'Stream',
    component: () => import('../views/Stream.vue'),
    meta: {
      title: 'Player',
      desc: 'OPENREC.tv ニコ生風プレイヤー'
    }
  }
]

const DEFAULT_TITLE = 'futon-openchat'
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
router.afterEach((to) => {
  document.title = to.meta.title + ' - ' + DEFAULT_TITLE || DEFAULT_TITLE;
  document.querySelector("meta[name='description']").setAttribute('content', to.meta.desc);
})

export default router
