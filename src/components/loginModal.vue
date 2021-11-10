<template>
  <modalWrap header="Login" @close="closeModal()">
    <div v-if="!isLogin" class="loginmodal">
      <form autocomplete="on">
        <v-text-field
          v-model="orUuid"
          label="uuid"
          hint="Get from openrec cookie"
          outlined
          dense
        ></v-text-field>
        <v-text-field
          v-model="orAccessToken"
          label="access-token"
          hint="Get from openrec cookie"
          type="password"
          @keydown.enter="orLogin"
          outlined
          dense
        ></v-text-field>
      </form>
      <v-btn
        @click="orLogin()"
        color="var(--v-background-lighten1)"
        small
        depressed
        >Login</v-btn
      >
    </div>
    <div v-else>
      <img :src="userInfo.icon" style="border-radius: 50%" />
      <div>{{ userInfo.nickname }}({{ userInfo.userid }})</div>
      <br />
      <v-btn
        @click="orLogout()"
        color="var(--v-background-lighten1)"
        small
        depressed
        >Logout</v-btn
      >
    </div>
  </modalWrap>
</template>

<script>
import modalWrap from "../components/modalWrap";

export default {
  name: "LoginModal",
  components: {
    modalWrap,
  },
  props: {
    isLogin: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  data() {
    return {
      orAccessToken: "",
      orUuid: "",
      userInfo: {
        nickname: "",
        userid: "",
        icon: "",
      },
    };
  },

  mounted() {
    this.getUserInfo();
  },

  methods: {
    orLogin() {
      localStorage.setItem("orAccessToken", this.orAccessToken);
      localStorage.setItem("orUuid", this.orUuid);
      this.$emit("updateLoginStatus", true);
      this.getUserInfo();
    },

    orLogout() {
      localStorage.removeItem("orAccessToken");
      localStorage.removeItem("orUuid");
      this.$emit("updateLoginStatus", false);
    },

    async getUserInfo() {
      if (
        localStorage.getItem("orAccessToken") &&
        localStorage.getItem("orUuid")
      ) {
        let param = {
          method: "GET",
          headers: {
            Accept: "application/json,text/plain,*/*",
            uuid: localStorage.getItem("orUuid"),
            "access-token": localStorage.getItem("orAccessToken"),
          },
        };
        let res = await fetch(
          "https://apiv5.openrec.tv/api/v5/users/me",
          param
        );
        if (res.ok) {
          let j = await res.json();
          j = j.data.items[0];
          this.userInfo.nickname = j.nickname;
          this.userInfo.userid = j.id;
          this.userInfo.icon = j.icon_image_url;
        }
      }
    },
    closeModal() {
      this.$emit("close");
    },
  },
};
</script>

<style scope>
.loginmodal {
  text-align: center;
}
</style>
