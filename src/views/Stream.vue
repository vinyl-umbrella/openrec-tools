<template>
  <div class="stream">
    <div class="flexbox">
      <v-text-field
        type="string"
        v-model.trim="inputUrl"
        label="OPENREC URL"
        @keydown.enter="playVideo"
        dense
        outlined
      ></v-text-field>
      <v-btn
        @click="playVideo"
        small
        depressed
        color="var(--v-background-lighten1)"
        >再生</v-btn
      >
    </div>
    {{ e_message }}
    <div style="margin: 0 auto; width: 90%">
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
        <v-btn
          @click="postInputComment"
          small
          depressed
          color="var(--v-background-lighten1)"
          >送信</v-btn
        >
      </div>
    </div>
  </div>
</template>

<script>
import Hls from "hls.js";
import orUtil from "../components/orComment";
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
      inputUrl: "",
      videoId: "",
      inputComment: "",
      thumbnail: "",
      messages: [],
      e_message: "",
    };
  },

  methods: {
    async connectWS(url) {
      let self = this;
      let sock = new WebSocket(url);
      sock.addEventListener("open", function () {
        console.info("-----CONNECT TO SERVER-----");
      });

      sock.addEventListener("message", async function (event) {
        let wsData = await orUtil.parseWsData(event.data);
        if (wsData[0] == "message") {
          let j = JSON.parse(wsData[1]);
          switch (j.type) {
            // message
            case 0: {
              let msgObj = { type: "normal", text: j.data.message };
              if (j.data.is_muted) {
                break
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
              sock.close();
            }
          }
        }
      });

      // error
      sock.addEventListener("error", function (event) {
        console.error("ws error:", event);
      });

      // close
      sock.addEventListener("close", function () {
        console.info("-----BYE SERVER-----");
        // self.connectWS(url);
      });

      let keepConnect = function () {
        sock.send("2");
      };
      setInterval(keepConnect, 25000);
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
.stream {
  margin-left: 2%;
  margin-right: 2%;
}

.flexbox {
  display: flex;
}
.v-btn {
  margin-left: 10px;
  margin-top: 6px;
}

.nico-player {
  position: relative;
  overflow: hidden;
}
</style>
