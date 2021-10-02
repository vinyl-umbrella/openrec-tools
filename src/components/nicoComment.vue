<template>
  <div id="nicoComme">
    <div v-for="(m, index) in shownMsg" :key="m.id">
      <div :class="'comment_base comment' + index" :style="updateFontSize">
        {{ m.message }}
      </div>
    </div>
    <span style="position: absolute; top: 0; opacity: 0.2; font-size: 50%">商用利用禁止 https://futonchan-openchat.web.app/stream</span>
  </div>
</template>

<script>
import anime from "animejs";

export default {
  name: "NicoComment",
  props: {
  },
  computed: {
    updateFontSize() {
      return {
        "--videoHeight": this.videoHeight + "px",
      };
    },
  },
  data() {
    return {
      videoHeight: 600,
      shownMsg: [
        { id: 0, message: "" },
        { id: 1, message: "" },
        { id: 2, message: "" },
        { id: 3, message: "" },
        { id: 4, message: "" },
        { id: 5, message: "" },
        { id: 6, message: "" },
        { id: 7, message: "" },
        { id: 8, message: "" },
        { id: 9, message: "" },
        { id: 10, message: "" },
        { id: 11, message: "" },
        { id: 12, message: "" },
        { id: 13, message: "" },
        { id: 14, message: "" },
        { id: 15, message: "" },
      ],
    };
  },
  mounted() {
    this.videoHeight = (document.getElementById("nicoComme").clientWidth * 9) / 16;
  },
  methods: {
    addMsg(msg) {
      let classname = "";
      // 空きチェック
      let index = this.shownMsg.findIndex((item) => item.message == "");
      if (index !== -1) {
        this.shownMsg[index].message = msg;
        classname = ".comment" + String(index);
        this.flowComment(index, classname);
      }
    },

    flowComment(index, classname) {
      let self = this;
      anime({
        targets: classname,
        translateX: function () {
          return [
            document.getElementById("nicoComme").clientWidth,
            -self.shownMsg[index].message.length * 35,
          ];
        },
        translateY: function () {
          let rand = anime.random(0, self.videoHeight - 120);
          return [rand, rand];
        },
        delay: 500,
        duration: 3500,
        easing: "linear",
        complete: function () {
          self.shownMsg[index].message = "";
        },
      });
    },
  },
};
</script>

<style scoped>
.comment_base {
  position: absolute;
  top: 0;
  font-size: calc(var(--videoHeight) / 20);
  font-weight: 700;
  color: snow;
  white-space: nowrap;
  user-select: none;
  text-shadow: 1px 1px 0 black, -1px 1px 0 black, 1px -1px 0 black,
    -1px -1px 0 black;
}
</style>
