<template>
  <div id="nicoComme">
    <div v-for="(m, index) in messages" :key="m.id">
      <div
        v-if="m.stamp"
        :class="'stamp-base comment' + index"
        style="width: 5vw"
      >
        <img :src="m.message" width="100%" />
      </div>
      <div v-else :class="'comment-base comment' + index" :style="fontSize">
        <p>{{ m.message }}</p>
      </div>
    </div>
    <span style="position: absolute; top: 0; opacity: 0.2; font-size: 50%"
      >商用利用禁止 https://futonchan-openchat.web.app/stream</span
    >
  </div>
</template>

<script setup>
import { defineExpose, onMounted, ref } from "vue";
import anime from "animejs";

const messages = ref([]);
const fontSize = ref(0);
let videoHeight = 600;

onMounted(() => {
  for (let i = 0; i < 32; i++) {
    messages.value.push({ id: i, message: "", stamp: false });
  }
  videoHeight = (document.getElementById("nicoComme").clientWidth * 9) / 16;
  fontSize.value = { "--videoHeight": videoHeight + "px" };
});

const addMsg = (msgObj) => {
  let classname = "";
  // check empty
  let index = messages.value.findIndex((item) => item.message == "");
  if (index !== -1) {
    messages.value[index].stamp = false;
    if (msgObj.type == "yell") {
      // 色付け
    } else if (msgObj.type == "stamp") {
      messages.value[index].stamp = true;
    }
    messages.value[index].message = msgObj.text;
    classname = ".comment" + String(index);
    flowComment(index, classname);
  }
};

const flowComment = (index, classname) => {
  let len = messages.value[index].message.length;
  if (messages.value[index].stamp) {
    len = 5;
  }
  anime({
    targets: classname,
    translateX: function () {
      return [document.getElementById("nicoComme").clientWidth, -len * 35];
    },
    translateY: function () {
      let rand = anime.random(0, videoHeight - 120);
      return [rand, rand];
    },
    delay: 1000,
    duration: 4000,
    easing: "linear",
    complete: () => {
      messages.value[index].message = "";
    },
  });
};

defineExpose({ addMsg });
</script>

<style scoped>
.comment-base {
  position: absolute;
  top: 0;
  font-size: calc(var(--videoHeight) / 20);
  font-weight: 700;
  color: snow;
  white-space: nowrap;
  user-select: none;
  text-shadow: 1px 1px 0 black, -1px 1px 0 black, 1px -1px 0 black,
    -1px -1px 0 black;
  opacity: 0.85;
}

.stamp-base {
  position: absolute;
  top: 0;
  white-space: nowrap;
  user-select: none;
}
</style>
