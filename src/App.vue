<template>
  <v-app :style="{background: $vuetify.theme.themes.dark.background}">
    <div id="app">
      <div id="nav">
        <span>
          <router-link to="/">Home</router-link> |
          <router-link to="/rank">Rank</router-link> |
          <router-link to="/chat">CommentViewer</router-link>
        </span>
        <span>
          <router-link to="/contact">Contact</router-link>
        </span>
      </div>
      <router-view/>
    </div>
  </v-app>
</template>


<style>
html {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* color: #2c3e50;
  background-color: snow; */
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

input {
  padding: 0.1em;
  transition: 0.3s;
  width: 5em;
  margin-right: 4px;
  border-radius: 2px;
}
</style>
