<template>
  <v-app :style="{ background: $vuetify.theme.themes.dark.background }">
    <div id="app">
      <div id="nav">
        <span>
          <router-link to="/">Home</router-link> |
          <router-link to="/rank">ランキング</router-link> |
          <router-link to="/chat">コメビュ</router-link> |
          <router-link to="/message">過去ログ検索</router-link>
          <router-link to="/stream" style="opacity: 0.05"
            >コメつき</router-link
          >
        </span>
        <span>
          <img
            id="loginBtn"
            alt="config"
            src="./assets/login.png"
            height="24px"
            width="24px"
            style="position: relative; top:5px"
            @click="callModal()"
          />
          <router-link to="/contact">Contact</router-link>
        </span>
        <login-modal
          :isLogin="isLogin"
          v-if="showModal"
          @close="closeModal()"
          @updateLoginStatus="isLogin = $event"
        />
      </div>
      <router-view />
    </div>
  </v-app>
</template>

<script>
import LoginModal from "./components/loginModal";
export default {
  components: {
    LoginModal,
  },
  data() {
    return {
      isLogin: false,
      showModal: false,
    };
  },
  mounted() {
    this.updateLoginStatus();
  },
  methods: {
    updateLoginStatus() {
      if (localStorage.getItem("orAccessToken") && localStorage.getItem("orUuid")) {
        this.isLogin = true;
      } else {
        this.isLogin = false;
      }
    },
    callModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
  },
};
</script>

<style>
html {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#nav {
  padding: 20px 0px 10px 0px;
  display: flex;
  justify-content: space-between;
}

#nav a {
  margin: 0px 10px 0px 10px;
  font-weight: bold;
  font-size: 20px;
  color: var(--v-primary-base-lighten1);
}

#nav a.router-link-exact-active {
  color: var(--v-secondary-base);
}

#loginBtn {
  background-color: var(--v-background-lighten5);
  border-radius: 18px;
  padding: 5px;
}
#loginBtn:active {
  background-color: var(--v-background-lighten4);
}
</style>
