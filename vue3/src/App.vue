<template>
  <div id="nav">
    <Button @click="menu = true" icon="pi pi-list" />
    <span>てすと</span>
    <Sidebar v-model:visible="menu">
      <h3>Menu</h3>
      <router-link to="/">Home</router-link>
      <br />
      <router-link to="/message">過去ログ検索</router-link>
      <br />
      <router-link to="/contact">Contact</router-link>
      <br />
    </Sidebar>
  </div>
  <router-view id="router-view" />
  <Toast />
</template>

<script setup>
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
  margin: 2%;
  text-align: left;
}

#router-view {
  padding-left: 2%;
  padding-right: 2%;
}
</style>
