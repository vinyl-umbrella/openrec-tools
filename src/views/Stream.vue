<template>
  <div class="stream">
    <div>
      <v-text-field
        type="string"
        v-model.trim="inputUrl"
        label="live OPENREC URL"
        @keydown.enter="playVideo"
        dense
        outlined
      ></v-text-field>
    </div>
    {{ e_message }}
    <!-- <div class="video" v-if="e_message==''"> -->
    <div class="video">
      <video ref="video" width="90%" controls></video>
    </div>
  </div>
</template>

<script>
import Hls from "hls.js";

export default {
  data() {
    return {
      hls: new Hls(),
      inputUrl: "",
      e_message: "",
    };
  },
  methods: {
    async getMediaFile() {
      let openrecUrl = this.inputUrl;
      if (openrecUrl.lastIndexOf("?") != -1) {
        openrecUrl = openrecUrl.slice(0, openrecUrl.lastIndexOf("?"));
      }

      let videoId = openrecUrl.replace("https://www.openrec.tv/live/", "");

      try {
        let res = await fetch(
          `https://public.openrec.tv/external/api/v5/movies/${videoId}`
        );
        let j = await res.json();
        if (!j.media.url) {
          this.e_message = "media file not found";
          return null;
        }
        return j.media.url;
      } catch (e) {
        this.e_message = `failed to fetch "${this.inputUrl}"`;
        return null;
      }
    },

    async playVideo() {
      this.stopVideo();
      let stream = await this.getMediaFile();
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
      this.hls = new Hls();
    },
  },
};
</script>

<style scoped>
.stream {
  margin-left: 10px;
  margin-right: 10px;
}

.video {
  text-align: center;
}
</style>
