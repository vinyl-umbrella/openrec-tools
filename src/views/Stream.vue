<template>
  <div class="stream">
    <div class="flexbox">
      <v-text-field
        type="string"
        v-model.trim="inputUrl"
        label="live OPENREC URL"
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
    <!-- <div class="video" v-if="e_message==''"> -->
    <div style="margin: 0 auto; width: 90%">
      <div class="nico-player">
        <video ref="video" width="100%" :poster="thumbnail" controls></video>
        <nicoComment ref="nicoComment" />
      </div>
      <v-text-field
        type="string"
        label="コメント(実装予定)"
        dense
        outlined
      ></v-text-field>
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
            case 0:
              self.$refs.nicoComment.addMsg(j.data.message);
              break;
            case 3:
              sock.close();
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
      let videoId = orUtil.getVideoId(this.inputUrl);
      try {
        let info = await orUtil.getVideoInfo(videoId);
        this.thumbnail = info.l_thumbnail_url;
        if (!info.media.url) {
          this.e_message = "media file not found";
          return;
        } else {
          stream = info.media.url;
        }
      } catch (e) {
        this.e_message = `failed to fetch "${this.inputUrl}"`;
        return;
      }

      let wsurl = await orUtil.getWsUrl(videoId);
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
