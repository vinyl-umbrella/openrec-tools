<template>
  <div id="app">
    <div id="nav">
      <Button @click="menu = true" icon="pi pi-list" />
      <Sidebar :visible="menu" :base-z-index="1000">
        <h3>Left Sidebar</h3>
        <router-link to="/">Home</router-link>
        <br />
        <router-link to="/about">About</router-link>
      </Sidebar>
    </div>
    <router-view />
  </div>
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
  text-align: center;
}

#nav {
  padding: 30px;
  text-align: left;
}
</style>
