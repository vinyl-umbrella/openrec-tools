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
      title: 'rank',
      desc: '布団ちゃん オプチャランク'
    }
  },
  {
    path: '/masaoroid',
    name: 'Masaoroid',
    component: () => import('../views/Masaoroid.vue'),
    meta: {
      title: 'masaoroid',
      desc: '布団ちゃん オプチャAI masaoroid'
    }
  },
  {
    path: '/contact',
    name: 'Contact',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
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
