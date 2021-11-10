<template>
  <div id="overlay" @click.self="$emit('close')">
    <div id="content">
      <h2>{{ header }}</h2>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: ["header"],
};
</script>

<style scoped>
#overlay {
  z-index: 8;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

#content {
  overflow: scroll;
  z-index: 9;
  width: 75%;
  height: 75%;
  padding: 1em 5% 1em 5%;
  border-radius: 10px;
  background-color: var(--v-background-base);
}
</style>
