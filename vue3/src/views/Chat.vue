<template>
  <div>
    <div>
      <div class="p-inputgroup">
        <InputText
          type="text"
          v-model="inputUrl"
          placeholder="URL"
          @keydown.enter="getPastComment"
        />
        <Button
          label="接続"
          class="p-button-outlined"
          @click="getPastComment"
        />
      </div>
    </div>

    <div>
      <div style="font-size: larger">
        <a :href="inputUrl" target="_blank" rel="noopener norefferer">
          {{ streamInfo.title }}
        </a>
        @{{ streamInfo.name }}
      </div>
      同接: {{ streamInfo.view }} コメ速: {{ calcAvg() }}/min
    </div>

    <Splitter
      style="
        height: 70vh;
        border: 1px var(--primary-color) solid;
        background-color: var(--surface-b);
      "
    >
      <SplitterPanel :size="60">
        <div id="comment-box">
          <div class="comments" v-for="comment in comments" :key="comment.id">
            <div class="user-name">
              <span :style="{ color: comment.color }">
                {{ comment.name }}
              </span>
              <span>
                {{ comment.time }}
              </span>
            </div>
            <span v-if="comment.message">
              {{ comment.message }}
            </span>
            <span v-if="comment.stamp">
              <img :src="comment.stamp" width="64" />
            </span>
          </div>
        </div>
      </SplitterPanel>
      <SplitterPanel :size="40">
        <div v-for="event in events" :key="event.id">
          <div>
            {{ event.message }}
          </div>
        </div>
      </SplitterPanel>
    </Splitter>

    <div>
      <div class="p-inputgroup">
        <InputText
          type="text"
          v-model="inputComment"
          placeholder="コメント"
          @keydown.enter="tempfunc"
        />
        <Button
          :label="String(inputComment.length) + '/100 送信'"
          class="p-button-outlined"
          @click="tempfunc"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import openrec from "../func/openrec";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import { useToast } from "primevue/usetoast";

const vid = ref(null);
const inputUrl = ref(null);
const inputComment = ref("");
const streamInfo = ref({
  title: "title",
  name: "streamer",
  view: 0,
  speed: 123,
});
const comments = ref([]);
const events = ref([]);
const toast = useToast();

const tempfunc = () => {
  inputComment.value = "";
};

const connectWs = (wss) => {
  let sock = new WebSocket(wss);
  sock.onmessage = (e) => {
    let data = openrec.parseWsData(e.data);
    if (data[0] === "message") {
      let msg = data[1].data;
      switch (data[1].type) {
        // msg
        case 0:
          comments.value.push(msg);
          if (comments.value.length > 2000) {
            comments.value.shift();
          }

          // scroll
          setTimeout(() => {
            document.getElementById("comment-box").scrollIntoView(false);
          }, 0);

          calcSpeed();
          break;
        // viewers
        case 1:
          streamInfo.value.view = msg.live_viewers;
          break;
      }
    }
  };

  setInterval(() => {
    sock.send("2");
  }, 25000);
};

const getPastComment = async () => {
  try {
    let info = await openrec.getVideoInfo(inputUrl.value);
    vid.value = info.vid;

    inputUrl.value = `https://www.openrec.tv/live/${vid.value}`;
    streamInfo.value.title = info.title;
    streamInfo.value.name = info.name;
    comments.value = await openrec.getComments(vid.value);

    setTimeout(() => {
      document.getElementById("comment-box").scrollIntoView(false);
    }, 0);
    connectWs(openrec.getWsUrl(info.mid));
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: e,
      life: 3000,
    });
    return;
  }
};

const calcSpeed = () => {
  var sub = function () {
    streamInfo.value.speed -= 1;
  };
  streamInfo.value.speed += 1;
  setTimeout(sub, 120000);
};

const calcAvg = () => {
  return parseInt(streamInfo.value.speed / 2);
};
</script>

<style>
.p-splitter-panel {
  overflow-y: scroll;
}

.comments {
  margin: 0.5em;
  background-color: var(--surface-a);
  padding: 3px;
  border-radius: 3px;
  word-break: break-all;
}

.user-name {
  font-size: smaller;
  display: flex;
  justify-content: space-between;
}
</style>
