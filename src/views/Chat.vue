<template>
  <div>
    <div class="p-inputgroup">
      <InputText
        type="text"
        v-model="inputUrl"
        placeholder="URL"
        @keydown.enter="getPastComment"
      />
      <Button label="接続" class="p-button-outlined" @click="getPastComment" />
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
          aria-label="config"
          @click="showModal = true"
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
      <SplitterPanel :size="70" id="comment-box">
        <div class="comments" v-for="comment in comments" :key="comment.id">
          <div class="user-name">
            <span :style="{ color: comment.color }">{{ comment.name }}</span>
            <span>
              <Button
                icon="pi pi-angle-double-left"
                class="p-button-sm p-button-rounded p-button-text"
                aria-label="quote"
                style="height: 1em; width: 1em"
                @click="quoteMsg(comment.message)"
              />
              <span>{{ comment.time }}</span>
            </span>
          </div>
          <span v-if="comment.message">{{ comment.message }}</span>
          <span v-else-if="comment.stamp">
            <img :src="comment.stamp" width="64" />
          </span>
        </div>
      </SplitterPanel>
      <SplitterPanel :size="30" id="info-box">
        <div class="info" v-for="(event, index) in events" :key="index">
          {{ event.date }}
          <span style="font-weight: bolder">[{{ event.type }}]&nbsp;</span>
          <span v-if="event.url">
            <a :href="event.url" target="_blank" rel="noopener norefferer">
              {{ event.message }}
            </a>
          </span>
          <span v-else>{{ event.message }}</span>
        </div>
      </SplitterPanel>
    </Splitter>

    <div class="p-inputgroup">
      <InputText
        type="text"
        v-model="inputComment"
        placeholder="コメント"
        id="input-box"
        @keydown.enter="postComment"
      />
      <Button
        :label="String(inputComment.length) + '/100 送信'"
        class="p-button-outlined"
        @click="postComment"
      />
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
import { useRoute } from "vue-router";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import { useToast } from "primevue/usetoast";
import configModalVue from "@/components/configModal.vue";
import openrec from "@/func/openrec";

const vid = ref(null);
const inputUrl = ref(useRoute().query.u);
const inputComment = ref("");
const streamInfo = ref({
  title: "title",
  name: "streamer",
  view: 0,
  speed: 0,
});
const comments = ref([]);
const events = ref([]);
const showModal = ref(false);
const toast = useToast();

let commentBox;
let infoBox;
let sock = null;

onMounted(() => {
  commentBox = document.getElementById("comment-box");
  infoBox = document.getElementById("info-box");
  if (inputUrl.value) {
    getPastComment();
  }
});

onBeforeUnmount(() => {
  if (sock) {
    sock.close();
  }
});

const connectWs = (wss) => {
  sock = new WebSocket(wss);
  const urlRegex = /https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+/;
  sock.onmessage = async function (e) {
    let data = openrec.parseWsData(e.data);
    if (data[0] === "message") {
      let msg = data[1].data;
      switch (data[1].type) {
        // msg
        case 0:
          if (msg.yell) {
            pushEvent("yell", `${msg.name} ${msg.yell}Pt ${msg.message}`);
          } else if (msg.capture) {
            pushEvent("capture", [
              `${msg.name} ${msg.capture.title}`,
              `https://www.openrec.tv/capture/${msg.capture.id}`,
            ]);
          }

          {
            let result = msg.message.match(urlRegex);
            if (result !== null) {
              pushEvent("url", [`${msg.name} ${msg.message}`, result[0]]);
            }
          }

          if (msg.userId === "indegnasen" || msg.userId === "yocchan-umaimon") {
            pushEvent("chat", `${msg.name} ${msg.message}`);
          }

          comments.value.push(msg);
          if (comments.value.length > 2000) {
            comments.value.shift();
          }

          // scroll
          setTimeout(() => {
            if (
              commentBox.scrollHeight -
                commentBox.clientHeight -
                commentBox.scrollTop <
              200
            ) {
              commentBox.lastElementChild.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
              });
            }
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
          sock.close();
          break;
        case 5:
          pushEvent("stream", "開始");
          break;

        // ban 追加/削除
        case 6: {
          let banUser = await findUserid(msg.owner_to_banned_user_id);
          pushEvent("ban", `追加 ${banUser[0]} ${banUser[1]}`);
          break;
        }
        case 7: {
          let banUser = await findUserid(msg.owner_to_banned_user_id);
          pushEvent("ban", `解除 ${banUser[0]} ${banUser[1]}`);
          break;
        }

        // staff 追加/削除
        case 8: {
          let staffUser = await findUserid(msg.owner_to_moderator_user_id);
          pushEvent("staff", `追加 ${staffUser[0]}`);
          break;
        }
        case 9: {
          let staffUser = await findUserid(msg.owner_to_moderator_user_id);
          pushEvent("staff", `解除 ${staffUser[0]}`);
          break;
        }

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

        // vote progress
        case 30:
          msg.votes.forEach((ele) => {
            pushEvent("vote", `[progress] ${ele.text} ${ele.count}票 ${ele.ratio}%`);
          });
          break;

        case 31:
          pushEvent("vote", `[end] ${msg.title}`);
          msg.votes.forEach((ele) => {
            pushEvent("vote", `${ele.text} ${ele.count}票 ${ele.ratio}%`);
          });
          break;

        //
        case 33:
          pushEvent("info", `${msg.message}`);
          break

        // extension
        case 43: {
          let extension_data = JSON.parse(msg.extension_data);
          if (
            extension_data.feature === "youtube-movie" &&
            extension_data.method === "register"
          ) {
            let youtubeUrl = `https://www.youtube.com/watch?v=${extension_data.data.youtubeMovie.id}&t=${extension_data.data.youtubeMovie.playPosition}`;
            pushEvent(extension_data.feature, [youtubeUrl, youtubeUrl]);
          }
          break;
        }

        default:
          console.log(data[1]);
      }
    }
  };

  sock.onclose = (e) => {
    console.log(e.code);
    if (e.code === 1006) {
      connectWs(wss);
    }
  };

  const findUserid = async function (id) {
    let name = `unknown(${id})`;
    let msg = [name, ""];
    for (let i = comments.value.length - 1; i >= 0; i--) {
      if (id === comments.value[i].recxuser_id) {
        name = comments.value[i].name;
        msg[0] = name;
        msg[1] = comments.value[i].message;
        return msg;
      }
    }

    // if not in comments, find from api
    let res = await fetch(
      "https://asia-northeast1-futonchan-openchat.cloudfunctions.net/api/v1/userdata/recxuserid",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recxuserid: id,
        }),
      }
    );
    if (res.ok) {
      let userdata = await res.json();
      msg[0] = `${userdata.nickname}(${userdata.id})`;
    }
    return msg;
  };

  let intervalId = setInterval(() => {
    if (sock.readyState === 3) {
      clearInterval(intervalId);
    } else {
      sock.send("2");
    }
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
  if (type === "capture" || type === "url" || type === "youtube-movie") {
    data.message = msg[0];
    data.url = msg[1];
    events.value.push(data);
  } else {
    events.value.push(data);
  }

  // scroll
  setTimeout(() => {
    if (
      infoBox.scrollHeight - infoBox.clientHeight - infoBox.scrollTop <
      500
    ) {
      infoBox.lastElementChild.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, 0);
};

const getPastComment = async () => {
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
    vid.value = info.vid;

    inputUrl.value = `https://www.openrec.tv/live/${vid.value}`;
    streamInfo.value.title = info.title;
    streamInfo.value.name = info.name;
    if (info.publicType === "member" && !localStorage.getItem("viewSubs")) {
      throw "member only";
    }
    comments.value = await openrec.getComments(vid.value);

    if (comments.value.length > 0) {
      setTimeout(() => {
        commentBox.lastElementChild.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 0);
    }
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

const quoteMsg = (msg) => {
  inputComment.value = msg + "←";
  document.getElementById("input-box").focus();
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
  scrollbar-width: thin;
}
.p-splitter-panel::-webkit-scrollbar {
  width: 8px;
}
.p-splitter-panel::-webkit-scrollbar-thumb {
  background-color: var(--surface-a);
}
.p-splitter-panel::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

.comments,
.info {
  margin: 0.5em;
  background-color: var(--surface-a);
  padding: 3px;
  border-radius: 3px;
  word-break: break-word;
}

.user-name {
  font-size: smaller;
  display: flex;
  justify-content: space-between;
}
</style>
