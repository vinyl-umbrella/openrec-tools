<template>
  <div class="config logout" v-if="isLogin">
    {{ userInfo.name }} ({{ userInfo.id }})
    <Button label="ログアウト" class="p-button-outlined" @click="logout" />
  </div>
  <div class="config" v-else>
    ログイン(openrec.tv cookieから取得)
    <div>
      <InputText
        type="text"
        placeholder="UUID"
        v-model="uuid"
        @keydown.enter="login"
      />
      <InputText
        type="password"
        placeholder="ACCESS TOKEN"
        v-model="token"
        @keydown.enter="login"
      />
      <Button label="ログイン" class="p-button-outlined" @click="login" />
    </div>
  </div>

  <div class="config" v-if="isLogin">
    ユーザ名の色変更(プレ垢限定)
    <div class="p-inputgroup">
      <InputText
        type="text"
        placeholder="Color"
        v-model="color"
        :style="{ backgroundColor: color }"
        @keydown.enter="updateNameColor"
      />
      <Button
        label="変更"
        class="p-button-outlined"
        @click="updateNameColor(color)"
      />
    </div>
  </div>

  <div class="config" v-if="isLogin">
    ブラックリストを同期
    <div class="p-inputgroup">
      <Button label="同期" class="p-button-outlined" @click="getBL" />
      <Button label="リセット" class="p-button-outlined" @click="resetBL" />
    </div>
  </div>

  <div class="config" v-if="isLogin">
    NGワードを同期
    <div class="p-inputgroup">
      <Button label="同期" class="p-button-outlined" @click="getNGwords" />
      <Button
        label="リセット"
        class="p-button-outlined"
        @click="resetNGwords"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const isLogin = ref(false);
const uuid = ref(null);
const token = ref(null);
const color = ref("#201E2F");
const userInfo = ref({
  id: "",
  name: "",
});

onMounted(() => {
  getMyInfo();
});

const login = () => {
  localStorage.setItem("orAccessToken", token.value);
  localStorage.setItem("orUuid", uuid.value);
  getMyInfo();
};

const logout = () => {
  localStorage.removeItem("orAccessToken");
  localStorage.removeItem("orUuid");
  resetBL();
  resetNGwords();
  isLogin.value = false;
};

const getMyInfo = async () => {
  if (localStorage.getItem("orAccessToken") && localStorage.getItem("orUuid")) {
    let param = {
      method: "GET",
      headers: {
        Accept: "application/json,text/plain,*/*",
        uuid: localStorage.getItem("orUuid"),
        "access-token": localStorage.getItem("orAccessToken"),
      },
    };
    let res = await fetch("https://apiv5.openrec.tv/api/v5/users/me", param);
    if (res.ok) {
      let j = await res.json();
      j = j.data.items[0];
      isLogin.value = true;
      userInfo.value.name = j.nickname;
      userInfo.value.id = j.id;
    } else {
      let j = await res.json();
      toast.add({
        severity: "error",
        summary: "Login failed",
        detail: j.message,
        life: 3000,
      });
    }
  }
};

const updateNameColor = async (color) => {
  let url = "https://apiv5.openrec.tv/api/v5/users/me/chat-setting";
  let param = {
    method: "PUT",
    headers: {
      Accept: "application/json,text/plain,*/*",
      "Content-Type": "application/json;charset=utf-8",
      uuid: localStorage.getItem("orUuid"),
      "access-token": localStorage.getItem("orAccessToken"),
    },
    body: JSON.stringify({ name_color: color }),
  };
  let res = await fetch(url, param);
  if (!res.ok) {
    throw (await res.json()).message;
  }
};

const getBL = async () => {
  let url = "https://apiv5.openrec.tv/api/v5/movies/n9ze3m2w184/detail";
  let param = {
    method: "GET",
    headers: {
      Accept: "application/json,text/plain,*/*",
      "Content-Type": "application/json;charset=utf-8",
      uuid: localStorage.getItem("orUuid"),
      "access-token": localStorage.getItem("orAccessToken"),
    },
  };
  try {
    let j = await (await fetch(url, param)).json();
    let bl = [];
    for (let data of j.data.items[0].blacklist) {
      bl.push(data.id);
    }
    localStorage.setItem("blacklist", bl);
  } catch {
    throw "Failed to get blacklist";
  }
};

const resetBL = () => {
  localStorage.setItem("blacklist", []);
};

const getNGwords = async () => {
  let url = "https://apiv5.openrec.tv/api/v5/users/me/banned-words";
  let param = {
    method: "GET",
    headers: {
      Accept: "application/json,text/plain,*/*",
      "Content-Type": "application/json;charset=utf-8",
      uuid: localStorage.getItem("orUuid"),
      "access-token": localStorage.getItem("orAccessToken"),
    },
  };
  try {
    let j = await (await fetch(url, param)).json();
    let words = [];
    for (let data of j.data.items) {
      words.push(data.word);
    }
    localStorage.setItem("ngwords", words);
  } catch {
    throw "Failed to get NG words";
  }
};

const resetNGwords = () => {
  localStorage.setItem("ngwords", []);
};
</script>

<style scoped>
.config {
  margin-top: 8px;
}
.logout {
  display: flex;
  align-items: center;
}
</style>
