<!-- <template>
  <div>
    <div class="flexbox">
      <v-text-field
        type="string"
        v-model.trim="inputUrl"
        label="OPENREC URL"
        ref="inputUrl"
        @keydown.enter="playVideo"
        hide-details
        dense
        outlined
      ></v-text-field>
      <v-btn @click="playVideo" outlined color="var(--v-primary-darken2)"
        >再生</v-btn
      >
    </div>
    {{ e_message }}
    <div class="nico-player">
      <video ref="video" width="100%" :poster="thumbnail" controls></video>
      <nicoComment ref="nicoComment" />
    </div>
    <div class="flexbox">
      <v-text-field
        type="string"
        label="コメント"
        v-model.trim="inputComment"
        @keydown.enter="postInputComment"
        dense
        outlined
      ></v-text-field>
      <v-btn @click="postInputComment" outlined color="var(--v-primary-darken2)"
        >送信</v-btn
      >
    </div>
  </div>
</template>

<script>
import Hls from "hls.js/dist/hls.light";
import orUtil from "../func/orUtil";
import NicoComment from "../components/nicoComment";

export default {
  components: {
    NicoComment,
  },

  data() {
    return {
      config: {
        fragLoadingTimeOut: 3000,
        fragLoadingMaxRetry: 10,
        fragLoadingMaxRetryTimeout: 3000,
        liveBackBufferLength: 1800,
        maxBufferSize: 256 * 1000 * 1000,
      },
      hls: new Hls(this.config),
      inputUrl: this.$route.query.u,
      videoId: "",
      inputComment: "",
      thumbnail: "",
      messages: [],
      e_message: "",
      sock: null,
    };
  },

  mounted() {
    this.$refs.inputUrl.focus();
    if (this.inputUrl) {
      this.playVideo();
    }
  },

  beforeRouteLeave(to, from, next) {
    if (this.sock) {
      this.sock.close();
      this.sock = null;
    }
    next();
  },

  methods: {
    async connectWS(url) {
      let self = this;
      this.sock = new WebSocket(url);
      this.sock.addEventListener("open", function () {
        console.info("-----CONNECT TO SERVER-----");
      });

      this.sock.onmessage = async function (event) {
        let wsData = await orUtil.parseWsData(event.data);
        let bl = localStorage.getItem("blacklist");
        if (wsData[0] == "message") {
          let j = JSON.parse(wsData[1]);
          switch (j.type) {
            // message
            case 0: {
              let msgObj = { type: "normal", text: j.data.message };
              if (j.data.is_muted) {
                break;
              }
              if (bl) {
                if (bl.includes(j.data.user_key)) {
                  break;
                }
              }
              if (j.data.yell != null) {
                msgObj.type = "yell";
                msgObj.text = `[${j.data.user_name}] ${j.data.yell.yells}円 ${j.data.message}`;
              } else if (j.data.stamp != null) {
                msgObj.type = "stamp";
                msgObj.text = j.data.stamp.image_url;
              } else if (j.data.capture != null) {
                msgObj.type = "capture";
              }
              self.$refs.nicoComment.addMsg(msgObj);
              break;
            }
            case 3: {
              this.sock.close();
            }
          }
        }
      };

      // error
      this.sock.onerror = function (event) {
        console.error("ws error:", event);
      };

      // close
      this.sock.onclose = function () {
        console.info("-----BYE SERVER-----");
        // self.connectWS(url);
      };

      let keepConn = setInterval(function () {
        if (!self.sock) {
          clearInterval(keepConn);
        } else {
          self.sock.send("2");
        }
      }, 25000);
    },

    async playVideo() {
      this.stopVideo();
      let stream = "";
      this.videoId = orUtil.getVideoId(this.inputUrl);
      try {
        let info = await orUtil.getVideoInfo(this.videoId);
        if (
          info.chat_public_type == "member" &&
          !localStorage.getItem("viewSubs")
        ) {
          this.e_message = "member only";
          return;
        }
        this.videoId = info.id;
        this.thumbnail = info.l_thumbnail_url;
        if (!info.media.url) {
          this.e_message = "media file not found";
        } else {
          stream = info.media.url;
        }
      } catch (e) {
        this.e_message = `failed to fetch "${this.inputUrl}"`;
        return;
      }

      let wsurl = await orUtil.getWsUrl(this.videoId);
      this.connectWS(wsurl);
      if (stream) {
        this.e_message = "";
        let hls = this.hls;
        let video = this.$refs["video"];
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
      }
    },

    stopVideo() {
      this.hls.destroy();
      this.hls = new Hls(this.config);
    },

    async postInputComment() {
      if (this.videoId != "" && this.inputComment != "") {
        let e_msg = await orUtil.postComment(this.videoId, this.inputComment);
        this.inputComment = "";
        if (e_msg != "") {
          console.warn(e_msg);
        }
      }
    },
  },
};
</script>

<style scoped>
.flexbox {
  display: flex;
}
.v-btn {
  margin-top: 2px;
}

.nico-player {
  position: relative;
  overflow: hidden;
}
</style> -->

<template>
  <div>hello!</div>
</template>

<script setup></script>

<style></style>
