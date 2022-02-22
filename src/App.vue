<template>
  <div id="nav">
    <Button @click="menu = true" aria-label="menu" icon="pi pi-list" />
    <h2 id="pagetitle"></h2>
    <Sidebar v-model:visible="menu">
      <h3 style="margin: 0">Menu</h3>
      <router-link to="/" @click="menu = false">Masaoroid</router-link><br />
      <router-link to="rank" @click="menu = false">ランキング</router-link
      ><br />
      <router-link to="/message" @click="menu = false">過去ログ検索</router-link
      ><br />
      <router-link to="/chat" @click="menu = false">コメビュ</router-link>
      <br />
      <router-link to="/stream" @click="menu = false">コメつき配信</router-link>
      <br />
      <router-link to="/api" @click="menu = false">OPENREC API</router-link>
      <br />
      <router-link to="/contact" @click="menu = false">問い合わせ</router-link>
    </Sidebar>
  </div>
  <router-view id="router-view" />
  <Toast />
</template>

<script setup>
import { ref } from "vue";
import Sidebar from "primevue/sidebar";

const menu = ref(false);
</script>

<style>
body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: var(--surface-a);
  font-weight: 400;
  color: var(--text-color);
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#nav {
  display: flex;
  margin-top: 2%;
  margin-left: 2%;
  margin-bottom: 2%;
  text-align: left;
}
#nav > h2 {
  margin: 0;
  padding-left: 1em;
}

#router-view {
  padding-left: 2%;
  padding-right: 2%;
  padding-bottom: 5em;
}
.router-link-exact-active {
  color: #03a9f4;
  font-weight: bolder;
}

a {
  color: var(--text-color);
}
a:hover {
  color: #03a9f4;
}

table {
  width: 100%;
  min-width: 300px;
  border-collapse: collapse;
  border: solid 3px var(--primary-color);
  word-break: break-all;
  margin-top: 10px;
}

table th,
table td {
  border: solid 1px var(--primary-color);
  padding: 6px;
}
</style>
