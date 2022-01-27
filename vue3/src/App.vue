<template>
  <div id="nav">
    <Button @click="menu = true" icon="pi pi-list" />
    <h2 id="pagetitle"></h2>
    <Sidebar v-model:visible="menu">
      <h3 style="margin: 0">Menu</h3>
      <router-link to="/">Masaoroid</router-link><br />
      <router-link to="rank">ランキング</router-link><br />
      <router-link to="/message">過去ログ検索</router-link><br />
      <router-link to="/chat">コメビュ</router-link><br />
      <router-link to="/stream">コメつき配信</router-link><br />
      <router-link to="/api">OPENREC API</router-link><br />
      <router-link to="/contact">問い合わせ</router-link>
    </Sidebar>
  </div>
  <router-view id="router-view" />
  <Toast />
</template>

<script setup>
import Sidebar from "primevue/sidebar";
import { ref } from "vue";

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
}

a {
  color: var(--text-color);
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
