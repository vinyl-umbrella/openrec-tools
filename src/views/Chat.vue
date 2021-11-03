<template>
  <div class="chat">
    <div class="flexbox">
      <div>
        <v-text-field
          type="string"
          class="url_box"
          v-model.trim="inputUrl"
          label="OPENREC URL"
          ref="inputUrl"
          @keydown.enter="getComment"
          dense
          outlined
        >
          <template v-slot:append-outer>
            <v-btn
              @click="getComment"
              small
              depressed
              color="var(--v-background-lighten1)"
              >接続</v-btn
            >
          </template>
        </v-text-field>
        <span v-show="urlError != ''"> {{ urlError }}</span>
      </div>
      <img
        id="configBtn"
        alt="config"
        src="../assets/conf.png"
        height="28px"
        width="28px"
        @click="callModal()"
      />
    </div>

    <div class="stream_data">
      <div class="title" v-show="streamUrl != ''">
        <a :href="streamUrl" target="_blank" rel="noopener norefferer">{{info.title}}</a>
      </div>
      <div class="channel_name">{{ info.channelName }}</div>

      <div>
        <span>同接: {{ info.viewers }}&nbsp;</span>
        <span>最大同接: {{ info.maxViewers }}&nbsp;</span>
        <span>コメ速: {{ calcAvg }}/min</span>
      </div>
    </div>

    <div class="flexbox">
      <div id="comment_box" class="comment_box">
        <div class="comments" v-for="(comment, index) in comments" :key="index">
          <div class="user_name">
            <span :style="{ color: comment.Color }">
              {{ comment.Name }}
            </span>
            <span>
              {{ comment.Time }}
            </span>
          </div>
          <span class="message" v-if="comment.Message != ''">{{
            comment.Message
          }}</span>
          <span v-if="comment.Stamp != ''">
            <img :src="comment.Stamp" width="64px" />
          </span>
        </div>
      </div>

      <div id="info_box" class="info_box">
        <div class="infos" v-for="(event, index) in events" :key="index">
          <span>{{ event.date }}&nbsp;</span>
          <span>[{{ event.type }}]&nbsp;</span>
          <span v-if="event.type == 'URL'">
            <span>{{ event.content[0] }}</span>
            <a
              :href="event.content[1]"
              target="_blank"
              rel="noopener norefferer"
              >{{ event.content[1] }}</a
            >
            <span>{{ event.content[2] }}</span>
          </span>
          <span v-else>
            {{ event.content }}
          </span>
        </div>
      </div>
    </div>
    <v-text-field
      type="string"
      v-model="inputComment"
      class="post_box"
      label="コメント"
      @keydown.enter="postInputComment"
      outlined
      dense
    >
      <template v-slot:append-outer>
        <v-btn
          @click="postInputComment"
          small
          depressed
          color="var(--v-background-lighten1)"
          >送信</v-btn
        >
      </template>
    </v-text-field>
    <span v-show="config.showStampBtn">
      Stamps:
      <v-btn
        class="stamp_btn"
        @click="postStamp(2533)"
        small
        depressed
        color="var(--v-background-lighten1)"
        >におうな</v-btn
      >
      <v-btn
        class="stamp_btn"
        @click="postStamp(2657)"
        small
        depressed
        color="var(--v-background-lighten1)"
        >んこー</v-btn
      >
      <v-btn
        class="stamp_btn"
        @click="postStamp(2658)"
        small
        depressed
        color="var(--v-background-lighten1)"
        >KP</v-btn
      >
      <v-btn
        class="stamp_btn"
        @click="postStamp(2659)"
        small
        depressed
        color="var(--v-background-lighten1)"
        >シュガー</v-btn
      > </span
    ><br />
    <span>{{ postError }}</span>

    <!-- Config modal -->
    <div id="overlay" v-show="config.showModal" @click.self="closeModal()">
      <div id="content" style="background-color: var(--v-background-base)">
        <div>
          <h2>Config</h2>
          <v-container fluid>
            <v-text-field
              v-model.number="config.maxCommentNum"
              label="チャット保持件数"
              outlined
              dense
            ></v-text-field>
            <v-checkbox
              v-model="config.hideNewcomer"
              label="新規ユーザを非表示"
            ></v-checkbox>
            <v-checkbox
              v-model="config.speesh"
              label="チャットを読み上げ"
            ></v-checkbox>
            <v-checkbox
              v-model="config.showStampBtn"
              label="スタンプボタンを表示 ※魔神サブスク限定"
            ></v-checkbox>
            <div class="flexbox">
              ブラックリストを同期
              <v-btn
                @click="syncBL"
                color="var(--v-background-lighten1)"
                small
                depressed
                style="margin-left: 4px;"
                >同期</v-btn
              >
              <v-btn
                @click="resetBL"
                color="var(--v-background-lighten1)"
                small
                depressed
                style="margin-left: 4px;"
                >リセット</v-btn
              >
            </div><br />
            <v-text-field
              label="NGワード(実装予定)"
              outlined
              dense
            ></v-text-field>
            <div class="flexbox">
              <v-text-field
                v-model.trim="config.nameColor"
                label="ユーザ名の色 (プレ垢限定)"
                outlined
                dense
                @keydown.enter="changeNameColor"
              ></v-text-field>
              <v-btn
                @click="changeNameColor"
                color="var(--v-background-lighten1)"
                small
                depressed
                style="margin-left: 4px; margin-top: 4px;"
                >変更</v-btn
              >
            </div>
          </v-container>
          <v-btn
            @click="closeModal()"
            color="var(--v-background-lighten1)"
            small
            depressed
            >close</v-btn
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import orUtil from "../components/orComment";

export default {
  data() {
    return {
      inputUrl: this.$route.query.u,
      streamUrl: "",
      urlError: "",
      inputComment: "",
      postError: "",

      info: {
        title: "",
        channelName: "",
        viewers: 0,
        maxViewers: 0,
        commentsSpeed: 0,
      },

      videoId: "",
      comments: [],
      events: [],
      wsConnectFlag: false,

      // config
      config: {
        showModal: false,
        maxCommentNum: 1500,
        hideNewcomer: false,
        showStampBtn: false,
        nameColor: "#201e2f",
        blacklist: [],
        speesh: false
      }
    };
  },

  computed: {
    calcAvg() {
      return parseInt(this.info.commentsSpeed / 2);
    },
  },

  mounted () {
    this.$refs.inputUrl.focus();
    if (this.inputUrl) {
      this.getComment();
    }

    let l = localStorage.getItem("blacklist");
    if (l) {
      this.config.blacklist = l.split(",");
    }
  },

  methods: {
    callModal() {
      this.config.showModal = true;
    },
    closeModal() {
      this.config.showModal = false;
    },

    isBottom(container) {
      return (
        (container.scrollHeight - container.scrollTop) * 0.95 <
        container.clientHeight
      );
    },

    scrollToBottom(container) {
      container.scrollTop = container.scrollHeight;
    },

    async connectWS(url) {
      let self = this;
      let sock = new WebSocket(url);
      sock.addEventListener("open", function () {
        console.info("-----CONNECT TO SERVER-----");
        self.wsConnectFlag = true;
      });

      sock.addEventListener("message", async function (event) {
        let wsData = await orUtil.parseWsData(event.data);
        if (wsData[0] == "message") {
          let j = JSON.parse(wsData[1]);

          let addEvent = (type, content) => {
            let prms = new Promise((resolve) => {
              let now = new Date();
              now.setHours(now.getHours() + 9);
              now = now.toISOString().replace("T", " ").replace("Z", " ");
              self.events.push({
                date: now,
                type: type,
                content: content,
              });
              resolve();
            });
            prms.then(() => {
              self.scrollToBottom(document.getElementById("info_box"));
            });

            // let ele = document.getElementById("info_box");
            // if (self.isBottom(ele)) {
            //   prms.then(() => {
            //     self.scrollToBottom(document.getElementById("info_box"));
            //   })
            // } else {
            //   ;
            // }
          };

          let findUserId = (id) => {
            let name = "unknown(" + id + ")";
            for (let i = self.comments.length - 1; i >= 0; i--) {
              if (id == self.comments[i].recxuser_id) {
                name = self.comments[i].Name;
                break;
              }
            }
            return name;
          };

          switch (j.type) {
            // message
            case 0:
              if (j.data.user_key != "") {
                // blacklist
                if (self.config.blacklist.includes(j.data.user_key)) {
                  break;
                }

                let name = j.data.user_name + " (" + j.data.user_key + ")";
                if (j.data.user_type == 1 || j.data.user_key == "yocchan-umaimon") {
                  addEvent("chat", name + " " + j.data.message);
                }
                if (j.data.yell != null) {
                  addEvent(
                    "yell",
                    name + " " + j.data.yell.yells + " " + j.data.message
                  );
                }
                if (j.data.badges.length != 0) {
                  name =
                    name + "[Sub" + j.data.badges[0].subscription.months + "]";
                }
                if (j.data.is_premium) {
                  name = name + "[P]";
                }
                if (j.data.is_fresh) {
                  name = name + "[Fresh]";
                  if (self.config.hideNewcomer) {
                    break;
                  }
                }
                if (j.data.is_moderator) {
                  name = name + "[Staff]";
                }
                if (j.data.is_muted) {
                  name = name + "[Muted]";
                }

                let result = j.data.message.match(
                  /https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+/
                );
                if (result != null) {
                  let a = [
                    j.data.message.slice(0, result["index"]),
                    result[0],
                    j.data.message.slice(result["index"] + result[0].length),
                  ];
                  addEvent("URL", a);
                }

                let commentData = {
                  Name: name,
                  recxuser_id: j.data.user_id,
                  Color: j.data.user_color,
                  Message: j.data.message,
                  Stamp: "",
                  Time: j.data.message_dt.slice(-8)
                };
                if (j.data.stamp != null) {
                  commentData.Stamp = j.data.stamp.image_url;
                }

                let addComment = (data) => {
                  self.comments.push(data);
                  if (self.config.speesh) {
                    let utter = new SpeechSynthesisUtterance(data.Message);
                    utter.rate = 1.5;
                    speechSynthesis.speak(utter);
                  }
                  if (self.comments.length > self.config.maxCommentNum) {
                    // self.comments = self.comments.slice(-self.config.maxCommentNum);
                    self.comments.shift();
                  }
                };

                // 自動スクロール
                let comment_box = document.getElementById("comment_box");
                if (self.isBottom(comment_box)) {
                  let prms = new Promise((resolve) => {
                    addComment(commentData);
                    resolve();
                  });
                  prms.then(() => {
                    self.scrollToBottom(comment_box);
                  });
                } else {
                  addComment(commentData);
                }

                self.calc_speed();
              }
              break;

            // 同接
            case 1:
              self.info.viewers = j.data.live_viewers;
              if (self.info.maxViewers < self.info.viewers) {
                self.info.maxViewers = self.info.viewers;
              }
              break;

            // 配信終了
            case 3:
              addEvent("stream", "finished");
              break;

            // 配信開始
            case 5:
              addEvent("stream", "start");
              break;

            // block
            case 6:
              addEvent(
                "ban",
                "ban " + findUserId(j.data.owner_to_banned_user_id)
              );
              break;

            // block 解除
            case 7:
              addEvent(
                "ban",
                "unban " + findUserId(j.data.owner_to_banned_user_id)
              );
              break;

            // スタッフ権限付与
            case 8:
              addEvent(
                "staff",
                "add staff " + findUserId(j.data.owner_to_moderator_user_id)
              );
              break;

            // スタッフ権限解除
            case 9:
              addEvent(
                "staff",
                "remove staff " + findUserId(j.data.owner_to_moderator_user_id)
              );
              break;

            // わからん refresh?
            case 10:
              if (j.data.need_refresh != null) {
                console.log(j.data);
              }
              break;

            // ゲーム変更，タイトル変更
            case 11:
              addEvent(
                "info",
                j.data.system_message.type + " " + j.data.message
              );
              break;

            // 12, 13, 15 テロップ．後で解析する
            case 12:
              break;
            case 13:
              break;
            case 15:
              break;

            // サブスク入会
            case 27:
              addEvent("info", j.data.message);
              break;

            // アンケート開始
            case 29:
              addEvent("vote", "[start] " + j.data.title);
              j.data.votes.forEach((elem) => {
                addEvent("vote", elem.text);
              });
              break;

            // アンケートの途中経過
            case 30:
              break;

            // アンケート結果
            case 31:
              addEvent("vote", "[fin] " + j.data.title);
              j.data.votes.forEach((elem) => {
                addEvent(
                  "vote",
                  elem.text + elem.count + "票 " + elem.ratio + "%"
                );
              });
              break;

            default:
              console.warn("unknown type:", j);
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
        self.wsConnectFlag = false;
        self.connectWS(url);
      });

      //なぜ"2"なのかはわからん
      var keepConnect = function () {
        sock.send("2");
      };
      setInterval(keepConnect, 25000);
    },

    async getComment() {
      let self = this;
      self.info.viewers = 0;
      self.info.maxViewers = 0;
      self.videoId = orUtil.getVideoId(self.inputUrl);

      self.comments = [];
      if (self.videoId != "") {
        let info = await orUtil.getVideoInfo(self.videoId);
        if (info.chat_public_type == "member" && !localStorage.getItem("viewSubs")) {
          self.urlError = "member only";
          return;
        }
        self.videoId = info.id;
        if (info.onair_status == 0 || info.onair_status == 1) {
          self.streamUrl = `https://www.openrec.tv/live/${self.videoId}`;
          self.info.title = info.title;
          self.info.channelName = info.channel.nickname;
        } else {
          self.urlError = "not on air now";
        }

        let now = new Date().toISOString();
        let url = `https://public.openrec.tv/external/api/v5/movies/${self.videoId}/chats?to_created_at=${now}&limit=150`;

        let past_comments = await (await fetch(url)).json();
        let prms = new Promise((resolve) => {
          for (let i = 0; i < past_comments.length; i++) {
            if (self.config.blacklist.includes(past_comments[i].user.id)) {
              continue;
            }
            let name =
              past_comments[i].user.nickname +
              " (" +
              past_comments[i].user.id +
              ")";
            if (past_comments[i].badges.length != 0) {
              name =
                name +
                "[Sub" +
                past_comments[i].badges[0].subscription.months +
                "]";
            }
            if (past_comments[i].user.is_premium) {
              name = name + "[P]";
            }
            if (past_comments[i].user.is_fresh) {
              name = name + "[Fresh]";
              if (self.config.hideNewcomer) {
                continue;
              }
            }
            if (past_comments[i].is_moderating) {
              name = name + "[Staff]";
            }
            if (past_comments[i].is_muted) {
              name = name + "[Muted]";
            }

            let comment = {
              Name: name,
              Color: past_comments[i].chat_setting.name_color,
              recxuser_id: past_comments[i].user.recxuser_id,
              Message: past_comments[i].message,
              Stamp: "",
              Time: past_comments[i].messaged_at.slice(11, -6)
            };
            if (past_comments[i].stamp != null) {
              comment.Stamp = past_comments[i].stamp.image_url;
            }
            self.comments.push(comment);
          }
          resolve();
        });

        prms.then(() => {
          self.scrollToBottom(document.getElementById("comment_box"));
        });

        let wsurl = await orUtil.getWsUrl(self.videoId);
        if (!self.wsConnectFlag) {
          self.connectWS(wsurl);
        }
      }
    },

    async postInputComment() {
      if (this.videoId != "" && this.inputComment != "") {
        let m = await orUtil.postComment(this.videoId, this.inputComment);
        this.inputComment = "";
        this.postError = m;
      }
    },

    async postStamp(stamp_id) {
      if (this.videoId != "") {
        let url =
          "https://apiv5.openrec.tv/api/v5/movies/" + this.videoId + "/chats";
        let data = {
          stamp_id: stamp_id,
          consented_chat_terms: false,
          message: this.inputComment,
          quality_type: 2,
          messaged_at: "",
          league_key: "",
          to_user_id: "",
        };
        let param = {
          method: "POST",
          headers: {
            Accept: "application/json,text/plain,*/*",
            "Content-Type": "application/json;charset=utf-8",
            uuid: localStorage.getItem("orUuid"),
            "access-token": localStorage.getItem("orAccessToken"),
          },
          body: JSON.stringify(data),
        };

        let j = await (await fetch(url, param)).json();
        this.inputComment = "";
        if (j.status != 0) {
          this.postError = j.message;
        } else {
          this.postError = "";
        }
      }
    },

    calc_speed() {
      let self = this;
      var sub = function () {
        self.info.commentsSpeed -= 1;
      };
      self.info.commentsSpeed += 1;
      setTimeout(sub, 120000);
    },

    async changeNameColor() {
      this.urlError = await orUtil.updateChatSetting({name_color: this.config.nameColor});
    },

    async syncBL() {
      let j = await orUtil.getBL();
      let bl = [];
      for (let data of j.data.items[0].blacklist) {
        bl.push(data.id);
      }
      localStorage.setItem("blacklist", bl);
    },

    resetBL() {
      localStorage.setItem("blacklist", [])
    },
  },
};
</script>

<style scoped>
.chat {
  margin-left: 2%;
  margin-right: 2%;
}

#overlay {
  z-index: 1;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
#content {
  z-index: 2;
  width: 75%;
  padding: 1em 10% 1em 10%;
  text-align: center;
}

a {
  color: var(--v-secondary-base);
}

.stream_data {
  border-top: dotted 2px var(--v-background-lighten3);
  border-bottom: dotted 2px var(--v-background-lighten3);
  margin-top: 5px;
  margin-bottom: 5px;
}

#configBtn {
  background-color: var(--v-background-lighten5);
  border-radius: 18px;
  padding: 5px;
  margin-top: 2px;
  margin-left: auto;
  margin-right: 5px;
}
#configBtn:active {
  background-color: var(--v-background-lighten4);
}

.title a {
  font-size: 24px;
}

.channel_name {
  font-size: 20px;
}

.flexbox {
  display: flex;
}

.info_box,
.comment_box {
  border: 2px solid var(--v-background-lighten5);
  height: 68vh;
  min-height: 50px;
  max-width: 900px;
  border-radius: 3px;
  margin-left: 10px;
  overflow-y: auto;
  background-color: var(--v-background-darken1);
}
.comment_box {
  width: 65vw;
}
.info_box {
  width: 30vw;
}

.infos,
.comments {
  margin: 0.8em;
  background-color: var(--v-background-base);
  color: var(--v-primary-base);
  padding: 0.3em 8px;
  border-radius: 7px;
  word-break: break-all;
}

.user_name {
  font-size: smaller;
  display: flex;
  justify-content: space-between;
}

.url_box {
  width: 40vw;
  max-width: 500px;
}
.post_box {
  margin-top: 20px;
  margin-left: 10px;
  min-width: 250px;
  width: 40vw;
}

.stamp_btn {
  margin-top: 5px;
  margin-left: 10px;
}
</style>
