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
    <div class="video" v-if="inputUrl != ''">
      <video ref="video" width="90%" controls></video>
    </div>
  </div>
</template>

<script>
import Hls from "hls.js";

export default {
  data() {
    return {
      inputUrl: "",
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
          "https://public.openrec.tv/external/api/v5/movies/" + videoId
        );
        let j = await res.json();
        return j.media.url;
      } catch (e) {
        console.error(e);
      }
    },
    async playVideo() {
      let hls = new Hls();
      let mediaFile = await this.getMediaFile();
      let stream = mediaFile;
      let video = this.$refs["video"];
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play();
      });
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
