<template>
  <v-app :style="{ background: $vuetify.theme.themes.dark.background }">
    <div id="app">
      <div id="nav">
        <v-navigation-drawer v-model="drawer" absolute temporary>
          <v-list-item>
            <v-list-item-content>
              <h3>Menu</h3>
              <router-link to="/">Home</router-link> <br />
              <router-link to="/rank">ランキング</router-link> <br />
              <router-link to="/message">過去ログ検索</router-link> <br />
              <router-link to="/chat">コメビュ</router-link> <br />
              <router-link to="/stream">コメつき</router-link> <br />
              <router-link to="/api">API</router-link> <br />
              <br />
              <span>
                ログイン<img
                  id="loginBtn"
                  alt="config"
                  src="./assets/login.png"
                  @click="callModal()"
                />
              </span>
              <router-link to="/contact">Contact</router-link>
            </v-list-item-content>
          </v-list-item>
        </v-navigation-drawer>
      </div>
      <login-modal
        :isLogin="isLogin"
        v-if="showModal"
        @close="closeModal()"
        @updateLoginStatus="isLogin = $event"
      />
      <v-btn
        color="var(--v-primary-darken2)"
        outlined
        @click.stop="drawer = !drawer"
        >Menu</v-btn
      >
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
      drawer: null,
      isLogin: false,
      showModal: false,
    };
  },
  mounted() {
    this.updateLoginStatus();
  },
  methods: {
    updateLoginStatus() {
      if (
        localStorage.getItem("orAccessToken") &&
        localStorage.getItem("orUuid")
      ) {
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
#app {
  padding-left: 2%;
  padding-right: 2%;
}

#nav a,
#nav span {
  margin-left: 10px;
  font-weight: bold;
  font-size: 18px;
  color: var(--v-primary-base-lighten1);
}

#nav a.router-link-exact-active {
  color: var(--v-secondary-base);
}

#loginBtn {
  background-color: var(--v-background-lighten5);
  border-radius: 18px;
  padding: 5px;
  max-width: 26px;
}
#loginBtn:hover {
  background-color: var(--v-background-lighten4);
}
</style>
