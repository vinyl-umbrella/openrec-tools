<template>
  <div id="nicoCome">
    <div v-for="(m, index) in 8" :key="m">
      <div
        :class="'comment_base comment' + index"
      >
        {{ currentMsg[index] }}
      </div>
    </div>
    {{ messages }}
  </div>
</template>

<script>
import anime from "animejs";

export default {
  name: "NicoComment",
  props: ["row", "fontsize", "height", "messages"],
  data() {
    return {
      currentMsg: [
        "さんぷる",
        "サンプル",
        "サンプル12345",
        "1234",
        "ああああ",
        "サンプルサンプルサンプル",
        "ああ",
        "ああああああああああああああああああああああああ",
      ],
    };
  },
  mounted() {
    anime({
      targets: ".comment_base",
      translateX: [document.getElementById("nicoCome").clientWidth, -100],
      translateY: function () {
        let rand = anime.random(0, 400);
        return [rand, rand];
      },
      duration: 2000,
      easing: "linear",
      loop: true,
    });
  },
  methods: {},
};
</script>

<style scoped>
.comment_base {
  position: absolute;
  top: 0;
  font-size: 20px;
  color: snow;
  white-space: nowrap;
  user-select: none;
  text-shadow: 1px 1px 1px black;
  /* animation-timing-function: linear;
  animation-duration: 4s;
  animation-fill-mode: forwards; */
}

/* .comment0 {
  animation-name: lane0;
}
@keyframes lane0 {
  from {
    transform: translate(85vw, 0%);
  }
  to {
    transform: translate(calc(0vw - 100%), 0%);
  }
}
*/
</style>
