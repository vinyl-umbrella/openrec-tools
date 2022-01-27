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
        同接: {{ streamInfo.view }} コメ速: {{ calcAvg() }}/min
      </div>
      <div>
        <Button
          icon="pi pi-cog"
          class="p-button-rounded p-button-outlined"
          @click="showConfig"
        />
      </div>
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
        <div id="info-box">
          <div class="info" v-for="(event, index) in events" :key="index">
            {{ event.date }} [{{ event.type }}]
            <span v-if="event.url">
              <a :href="event.url" target="_blank" rel="noopener norefferer">
                {{ event.url }}
              </a>
            </span>
            <span v-else>
              {{ event.message }}
            </span>
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
          @keydown.enter="postComment"
        />
        <Button
          :label="String(inputComment.length) + '/100 送信'"
          class="p-button-outlined"
          @click="postComment"
        />
      </div>
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
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import { useToast } from "primevue/usetoast";
import configModalVue from "@/components/configModal.vue";
import openrec from "@/func/openrec";

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
const showModal = ref(false);
const toast = useToast();

onMounted(() => {
  const route = useRoute();
  if (route.query.u) {
    inputUrl.value = route.query.u;
    getPastComment();
  }
});

const connectWs = (wss) => {
  let sock = new WebSocket(wss);
  sock.onmessage = (e) => {
    let data = openrec.parseWsData(e.data);
    if (data[0] === "message") {
      let msg = data[1].data;
      switch (data[1].type) {
        // msg
        case 0:
          if (msg.yell) {
            pushEvent("yell", `${msg.name} ${msg.yell}Pt ${msg.message}`);
          } else if (msg.capture) {
            pushEvent("capture", [msg.name, msg.capture.id, msg.capture.title]);
          }

          comments.value.push(msg);
          if (comments.value.length > 2000) {
            comments.value.shift();
          }

          // scroll
          setTimeout(() => {
            let ele = document.getElementById("comment-box");
            // console.log(ele.scrollHeight - ele.clientHeight, ele.scrollTop);
            ele.scrollIntoView({ behavior: "smooth", block: "end" });
          }, 0);

          calcSpeed();
          break;
        // viewers
        case 1:
          streamInfo.value.view = msg.live_viewers;
          break;

        // stream start/end
        case 3:
          pushEvent("stream", "終了");
          break;
        case 5:
          pushEvent("stream", "開始");
          break;

        // ban 追加/削除
        case 6:
          pushEvent("ban", `追加 ${msg.owner_to_banned_user_id}`);
          break;
        case 7:
          pushEvent("ban", `解除 ${msg.owner_to_banned_user_id}`);
          break;

        // staff 追加/削除
        case 8:
          pushEvent("staff", `追加 ${msg.owner_to_moderator_user_id}`);
          break;
        case 9:
          pushEvent("staff", `解除 ${msg.owner_to_moderator_user_id}`);
          break;

        case 10:
          break;

        case 11:
          pushEvent("info", `${msg.system_message.type} ${msg.message}`);
          break;

        case 27:
          pushEvent("info", `${msg.message}`);
          break;

        // vote start
        case 29:
          pushEvent("vote", `[start] ${msg.title}`);
          msg.votes.forEach((ele) => {
            pushEvent("vote", ele.text);
          });
          break;

        case 31:
          pushEvent("vote", `[end] ${msg.title}`);
          msg.votes.forEach((ele) => {
            pushEvent("vote", `${ele.text} ${ele.count}票 ${ele.ratio}%`);
          });
          break;

        default:
          console.log(msg);
      }
    }
  };

  setInterval(() => {
    sock.send("2");
  }, 25000);
};

const pushEvent = (type, msg) => {
  let now = new Date();
  now.setHours(now.getHours() + 9);
  now = now.toISOString().replace("T", " ").replace("Z", " ").slice(0, -5);
  let data = {
    date: now,
    type: type,
    url: null,
    message: msg,
  };
  if (type === "capture") {
    data.message = `${msg[0]} ${msg[2]}`;
    data.url = `https://www.openrec.tv/capture/${msg[1]}`;
    events.value.push(data);
  } else {
    events.value.push(data);
  }

  // scroll
  setTimeout(() => {
    let ele = document.getElementById("info-box");
    ele.scrollIntoView({ behavior: "smooth", block: "end" });
  }, 0);
};

const getPastComment = async () => {
  try {
    let info = await openrec.getVideoInfo(inputUrl.value);
    vid.value = info.vid;

    inputUrl.value = `https://www.openrec.tv/live/${vid.value}`;
    streamInfo.value.title = info.title;
    streamInfo.value.name = info.name;
    if (info.publicType === "member" && !localStorage.getItem("viewSubs")) {
      throw "member only";
    }
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

const showConfig = () => {
  showModal.value = true;
};
</script>

<style>
.p-splitter-panel {
  overflow-y: scroll;
}

.comments,
.info {
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
