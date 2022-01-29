<template>
  <div>
    <div class="p-inputgroup">
      <InputText
        type="text"
        v-model="inputUrl"
        placeholder="URL"
        @keydown.enter="playVideo"
      />
      <Button label="接続" class="p-button-outlined" @click="playVideo" />
    </div>

    <div
      style="display: flex; align-items: center; justify-content: space-between"
    >
      <div>
        <div style="font-size: larger">
          <a :href="inputUrl" target="_blank" rel="noopener norefferer">
            {{ streamInfo.title }}
          </a>
          @{{ streamInfo.name }}
        </div>
      </div>
      <div>
        <Button
          icon="pi pi-cog"
          class="p-button-rounded p-button-outlined"
          aria-label="config"
          @click="showModal = true"
        />
      </div>
    </div>

    <div class="nico-player">
      <video id="video" :poster="thumbnail" controls></video>
      <nicoCommentVue ref="nicoComment" />
    </div>

    <div class="p-inputgroup">
      <InputText
        type="text"
        v-model="inputComment"
        placeholder="コメント"
        @keydown.enter="postComment"
      />
      <Button label="送信" class="p-button-outlined" @click="postComment" />
    </div>

    <Dialog
      v-model:visible="showModal"
      :modal="true"
      :dismissableMask="true"
      header="設定"
    >
      <configModalVue />
    </Dialog>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import Hls from "hls.js/dist/hls.light";
import { useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import openrec from "@/func/openrec";
import configModalVue from "../components/configModal.vue";
import nicoCommentVue from "../components/nicoComment.vue";

const inputUrl = ref(useRoute().query.u);
const vid = ref(null);
const streamInfo = ref({
  title: "title",
  name: "streamer",
});
const inputComment = ref(null);
const nicoComment = ref(null);
const thumbnail = ref(null);
const showModal = ref(false);
const toast = useToast();

let hls;
let sock;

onMounted(() => {
  hls = new Hls({
    fragLoadingTimeOut: 3000,
    fragLoadingMaxRetry: 10,
    fragLoadingMaxRetryTimeout: 3000,
    liveBackBufferLength: 1800,
    maxBufferSize: 256 * 1000 * 1000,
  });
  if (inputUrl.value) {
    playVideo();
  }
});

onBeforeUnmount(() => {
  if (hls) {
    hls.destroy();
  }
  if (sock) {
    sock.close();
  }
});

const connectWs = async (url) => {
  sock = new WebSocket(url);
  sock.onmessage = (e) => {
    let data = openrec.parseWsData(e.data);
    if (data[0] === "message") {
      let msg = data[1].data;
      let msgData = { type: "normal", text: msg.message };
      if (data[1].type === 0) {
        if (msg.yell) {
          msgData.type = "yell";
          msgData.text = `[${msg.name}] ${msg.yell}Pt ${msg.message}`;
        } else if (msg.capture) {
          msgData.type = "capture";
        } else if (msg.stamp) {
          msgData.type = "stamp";
          msgData.text = msg.stamp;
        }
        nicoComment.value.addMsg(msgData);
      } else if (data[1].type === 3) {
        sock.close();
      }
    }
  };

  let intervalId = setInterval(() => {
    if (!sock) {
      clearInterval(intervalId);
    }
    sock.send("2");
  }, 25000);
};

const playVideo = async () => {
  if (sock) {
    toast.add({
      severity: "warn",
      summary: "Warn",
      detail: "Already connected to chat server. Please reload page.",
      life: 3000,
    });
    return;
  }
  try {
    let info = await openrec.getVideoInfo(inputUrl.value);
    let stream;
    vid.value = info.vid;
    streamInfo.value.title = info.title;
    streamInfo.value.name = info.name;
    inputUrl.value = `https://www.openrec.tv/live/${vid.value}`;
    if (info.publicType === "member" && !localStorage.getItem("viewSubs")) {
      throw "member only";
    }
    thumbnail.value = info.thumbnail_url;
    if (info.media) {
      stream = info.media;
    } else {
      throw "no media file";
    }
    connectWs(openrec.getWsUrl(info.mid));

    let video = document.getElementById("video");
    hls.loadSource(stream);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play();
    });
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: e,
      life: 3000,
    });
  }
};

const postComment = async () => {
  if (vid.value && inputComment.value !== "") {
    try {
      await openrec.postComment(vid.value, inputComment.value);
      inputComment.value = "";
    } catch (e) {
      toast.add({
        severity: "error",
        summary: "Failed",
        detail: e,
        life: 3000,
      });
    }
  }
};
</script>

<style scoped>
.nico-player {
  position: relative;
  overflow: hidden;
}
video {
  width: 100%;
}
</style>
