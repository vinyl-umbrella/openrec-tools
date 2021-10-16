<template>
  <div id="nicoComme">
    <div v-for="(m, index) in shownMsg" :key="m.id">
      <div v-if="m.stamp" :class="'stamp_base comment' + index" style="width: 5vw">
        <img :src="m.message" width="100%" />
      </div>
      <div v-else :class="'comment_base comment' + index" :style="updateFontSize">
        <p>{{ m.message }}</p>
      </div>
    </div>
    <span style="position: absolute; top: 0; opacity: 0.2; font-size: 50%">商用利用禁止 https://futonchan-openchat.web.app/stream</span>
  </div>
</template>

<script>
import anime from "animejs";

export default {
  name: "NicoComment",
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
      shownMsg: [],
    };
  },
  mounted() {
    for (let i = 0; i < 32; i++) {
      this.shownMsg.push({ id: i, message: "", stamp: false });
    }
    this.videoHeight = (document.getElementById("nicoComme").clientWidth * 9) / 16;
  },
  methods: {
    addMsg(msgObj) {
      let classname = "";
      // 空きチェック
      let index = this.shownMsg.findIndex((item) => item.message == "");
      if (index !== -1) {
        this.shownMsg[index].stamp = false;
        if (msgObj.type == "yell") {
          // 色付け
        } else if (msgObj.type == "stamp") {
          this.shownMsg[index].stamp = true;
        }
        this.shownMsg[index].message = msgObj.text;
        classname = ".comment" + String(index);
        this.flowComment(index, classname);
      }
    },

    flowComment(index, classname) {
      let self = this;
      let len = self.shownMsg[index].message.length;
      if (this.shownMsg[index].stamp) {
        len = 5;
      }
      anime({
        targets: classname,
        translateX: function () {
          return [document.getElementById("nicoComme").clientWidth, -len * 35];
        },
        translateY: function () {
          let rand = anime.random(0, self.videoHeight - 120);
          return [rand, rand];
        },
        delay: 1000,
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
  opacity: 0.85;
}

.stamp_base {
  position: absolute;
  top: 0;
  white-space: nowrap;
  user-select: none;
}
</style>
