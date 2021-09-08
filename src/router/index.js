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
      desc: 'オプチャAI masaoroid'
    }
  },
  {
    path: '/rank',
    name: 'Rank',
    component: () => import('../views/Rank.vue'),
    meta: {
      title: 'rank',
      desc: '布団ちゃん オプチャランク'
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: () => import('../views/Contact.vue'),
    meta: {
      title: 'Contact',
      desc: '要望、連絡先など'
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/Chat.vue'),
    meta: {
      title: 'Chat',
      desc: 'OPENREC.tv コメントビューア'
    }
  },
  {
    path: '/message',
    name: 'Message',
    component: () => import('../views/Message.vue'),
    meta: {
      title: 'Explore Messages',
      desc: 'おぷちゃ過去ログ検索システム'
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
