<template>
  <div class="chat">
    <div class="flexbox">
      <div id="inputUrl">
        URL:
        <input
          type="text"
          class="url_box"
          v-model.trim="inputUrl"
          placeholder="OPENREC URL"
          @keydown.enter="getComment"
        />
        <v-btn
          @click="getComment"
          small
          depressed
          color="var(--v-background-lighten1)"
          >Connect</v-btn
        >
        <span> {{ urlError }}</span>
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
        <a :href="streamUrl" target="_blank" rel="noopener norefferer">{{
          title
        }}</a>
      </div>
      <div class="channel_name">{{ channelName }}</div>
      <br />

      <div>
        <span>同接: {{ viewers }}&nbsp;</span>
        <span>最大同接: {{ maxViewers }}&nbsp;</span>
        <span>コメ速: {{ calcAvg }}/min</span>
      </div>
    </div>

    <div class="flexbox">
      <div id="comment_box" class="comment_box">
        <div class="comments" v-for="(comment, index) in comments" :key="index">
          <div class="user_name" :style="{ color: comment.Color }">
            {{ comment.Name }}
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
    <input
      type="text"
      v-model="inputComment"
      class="post_box"
      placeholder="Comment"
      @keydown.enter="postComment"
    />
    <v-btn
      @click="postComment"
      small
      depressed
      color="var(--v-background-lighten1)"
      >post</v-btn
    >
    <span> {{ inputComment.length }}/100</span><br />
    <span v-show="showStampBtn">
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
    <div id="overlay" v-show="showModal" @click.self="closeModal()">
      <div id="content" style="background-color: var(--v-background-base)">
        <div v-if="!isLogin">
          <form autocomplete="on">
            <v-text-field
              v-model="orUuid"
              label="uuid"
              hint="Get from openrec cookie"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              v-model="orAccessToken"
              label="access-token"
              hint="Get from openrec cookie"
              type="password"
              outlined
              dense
            ></v-text-field>
          </form>
          <v-btn
            @click="closeModal()"
            color="var(--v-background-lighten1)"
            small
            depressed
            style="margin-right: 4px"
            >cancel</v-btn
          >
          <v-btn
            @click="orLogin()"
            color="var(--v-background-lighten1)"
            small
            depressed
            >Login</v-btn
          >
        </div>
        <div v-else>
          <h2>Config</h2>
          <v-container fluid>
            <v-text-field
              v-model.number="maxCommentNum"
              label="チャット保持件数"
              outlined
              dense
            ></v-text-field>
            <v-checkbox
              v-model="hideNewcomer"
              label="新規ユーザを非表示"
            ></v-checkbox>
            <v-checkbox
              v-model="showStampBtn"
              label="スタンプボタンを表示 ※魔神サブスク限定"
            ></v-checkbox>
          </v-container>
          <v-btn
            @click="closeModal()"
            color="var(--v-background-lighten1)"
            small
            depressed
            style="margin-right: 4px"
            >close</v-btn
          >
          <v-btn
            @click="orLogout()"
            color="var(--v-background-lighten1)"
            small
            depressed
            >Logout</v-btn
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // ログイン, Config
      showModal: false,
      // login info
      isLogin: false,
      orUuid: "",
      orAccessToken: "",

      inputUrl: "",
      streamUrl: "",
      urlError: "",
      inputComment: "",
      postError: "",

      title: "",
      channelName: "",
      viewers: 0,
      maxViewers: 0,
      commentsSpeed: 0,

      videoId: "",

      comments: [],
      events: [],
      wsConnectFlag: false,

      // config
      maxCommentNum: 1500,
      hideNewcomer: false,
      showStampBtn: false,
    };
  },

  computed: {
    calcAvg() {
      return parseInt(this.commentsSpeed / 2);
    },
  },

  mounted() {
    this.updateLoginStatus();
  },

  methods: {
    updateLoginStatus() {
      let getCookieArray = () => {
        let arr = new Array();
        if (document.cookie != "") {
          let tmp = document.cookie.split("; ");
          for (let i = 0; i < tmp.length; i++) {
            let data = tmp[i].split("=");
            arr[data[0]] = decodeURIComponent(data[1]);
          }
        }
        return arr;
      };

      let cookieArray = getCookieArray();

      if (
        cookieArray["orUuid"] != "" &&
        cookieArray["orAccessToken"] != "" &&
        cookieArray["orUuid"] &&
        cookieArray["orAccessToken"]
      ) {
        this.isLogin = true;
        this.orUuid = cookieArray["orUuid"];
        this.orAccessToken = cookieArray["orAccessToken"];
      } else {
        this.isLogin = false;
        this.orUuid = "";
        this.orAccessToken = "";
      }
    },

    orLogin() {
      // let param = {
      //   method: "POST",
      //   mode: "no-cors",
      //   credentials: "include",
      //   headers: {
      //     "Accept": "application/json,text/plain,",
      //     "Content-Type": "application/json; charset=utf-8"
      //   },
      // }
      // let res = await fetch("https://www.openrec.tv/api-tv/user", param);

      // console.log(res.headers);

      // param = {
      //   method: "POST",
      //   mode: "no-cors",
      //   credentials: "include",
      //   headers: {
      //     "Accept": "application/json,text/plain,",
      //     "Content-Type": "application/json; charset=utf-8",
      //     "Uuid": "",
      //     "Token": "",
      //     "Random": "",
      //     "_gcl_au": "",
      //     "AWSELB": "",
      //     "AWSELBCORS": ""
      //   },
      // }
      // res = await fetch("https://www.openrec.tv/viewapp/v4/mobile/user/login", param);
      let d = new Date();
      d.setDate(d.getDate() + 7);
      let expire = d.toUTCString();
      document.cookie =
        "orUuid=" +
        this.orUuid +
        "; path=/;  expires=" +
        expire +
        "; Secure; SameSite=lax;";
      document.cookie =
        "orAccessToken=" +
        this.orAccessToken +
        "; path=/;  expires=" +
        expire +
        "; Secure; SameSite=lax;";
      this.updateLoginStatus();
    },

    orLogout() {
      document.cookie = "orUuid=";
      document.cookie = "orAccessToken=";
      this.updateLoginStatus();
    },

    callModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
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

    async getMovieId() {
      let self = this;
      const URLHEAD = "https://www.openrec.tv/live/";
      const mURLHEAD = "https://www.openrec.tv/m/live/";
      let videoUrl = self.inputUrl;
      let videoId = "";
      if (videoUrl.indexOf(mURLHEAD) != -1) {
        videoUrl = videoUrl.replace(mURLHEAD, URLHEAD);
        self.inputUrl = videoUrl;
      }
      if (videoUrl.indexOf(URLHEAD)) {
        self.urlError = "invalid url";
        return "";
      } else {
        self.urlError = "";
        if (videoUrl.lastIndexOf("?") != -1) {
          videoUrl = videoUrl.slice(0, videoUrl.lastIndexOf("?"));
        }
        self.streamUrl = self.inputUrl;

        videoId = videoUrl.replace(URLHEAD, "");
        self.videoId = videoId;
        let apiUrl =
          "https://public.openrec.tv/external/api/v5/movies/" + videoId;
        let movieId = "";
        try {
          let res = await (await fetch(apiUrl)).json();
          if (res.onair_status == 0 || res.onair_status == 1) {
            self.title = res.title;
            self.channelName = res.channel.nickname;
            movieId = res.movie_id;
          } else {
            self.urlError = "not on air now";
          }
        } catch (e) {
          console.error(e);
          self.urlError = "invalid url";
        }
        return movieId;
      }
    },

    async connectWS(url) {
      let self = this;
      let sock = new WebSocket(url);
      sock.addEventListener("open", function () {
        console.info("-----CONNECT TO SERVER-----");
        self.wsConnectFlag = true;
      });

      sock.addEventListener("message", function (event) {
        if (event.data.length > 2) {
          let pos = event.data.indexOf("[");
          if (pos == 2) {
            let orig = JSON.parse(event.data.substr(pos));
            if (orig[0] == "message") {
              let j = JSON.parse(orig[1]);

              let addEvent = (type, content) => {
                let prms = new Promise((resolve) => {
                  const d = new Date();
                  let now =
                    ("00" + (d.getMonth() + 1)).slice(-2) +
                    "-" +
                    ("00" + d.getDate()).slice(-2) +
                    " " +
                    ("00" + d.getHours()).slice(-2) +
                    ":" +
                    ("00" + d.getMinutes()).slice(-2) +
                    ":" +
                    ("00" + d.getSeconds()).slice(-2);
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
                        name +
                        "[Sub" +
                        j.data.badges[0].subscription.months +
                        "]";
                    }
                    if (j.data.is_premium) {
                      name = name + "[P]";
                    }
                    if (j.data.is_fresh) {
                      name = name + "[Fresh]";
                      if (self.hideNewcomer) {
                        break;
                      }
                    }
                    if (j.data.is_moderator) {
                      name = name + "[Staff]";
                      if (self.hideNewcomer) {
                        break;
                      }
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
                        j.data.message.slice(
                          result["index"] + result[0].length
                        ),
                      ];
                      addEvent("URL", a);
                    }

                    let commentData = {
                      Name: name,
                      recxuser_id: j.data.user_id,
                      Color: j.data.user_color,
                      Message: j.data.message,
                      Stamp: "",
                    };
                    if (j.data.stamp != null) {
                      commentData.Stamp = j.data.stamp.image_url;
                    }

                    let addComment = (data) => {
                      self.comments.push(data);
                      if (self.comments.length > self.maxCommentNum) {
                        // self.comments = self.comments.slice(-self.maxCommentNum);
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
                  self.viewers = j.data.live_viewers;
                  if (self.maxViewers < self.viewers) {
                    self.maxViewers = self.viewers;
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
                    "remove staff " +
                      findUserId(j.data.owner_to_moderator_user_id)
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
            } else {
              console.warn("unknown format:", orig);
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
      self.viewers = 0;
      self.maxViewers = 0;
      let movieId = await self.getMovieId();
      self.comments = [];
      if (movieId != "") {
        // current date
        const d = new Date();
        let now =
          d.getFullYear() +
          "-" +
          ("00" + (d.getMonth() + 1)).slice(-2) +
          "-" +
          ("00" + d.getDate()).slice(-2) +
          "T" +
          ("00" + d.getHours()).slice(-2) +
          ":" +
          ("00" + d.getMinutes()).slice(-2) +
          ":" +
          ("00" + d.getSeconds()).slice(-2) +
          "Z";

        // get past comment
        let url =
          "https://public.openrec.tv/external/api/v5/movies/" +
          self.videoId +
          "/chats?to_created_at=" +
          now +
          "&limit=150";

        let past_comments = await (await fetch(url)).json();
        let prms = new Promise((resolve) => {
          for (let i = 0; i < past_comments.length; i++) {
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
              if (self.hideNewcomer) {
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

        url =
          "wss://chat.openrec.tv/socket.io/?movieId=" +
          movieId +
          "&EIO=3&transport=websocket";
        if (!self.wsConnectFlag) {
          self.connectWS(url);
        }
      }
    },

    async postComment() {
      let self = this;
      if (self.videoId != "" && self.inputComment != "" && self.isLogin) {
        let url =
          "https://apiv5.openrec.tv/api/v5/movies/" + self.videoId + "/chats";
        let data = {
          consented_chat_terms: false,
          message: self.inputComment,
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
            uuid: self.orUuid,
            "access-token": self.orAccessToken,
          },
          body: JSON.stringify(data),
        };

        let j = await (await fetch(url, param)).json();
        self.inputComment = "";
        if (j.status != 0) {
          self.postError = j.message;
        } else {
          self.postError = "";
        }
      }
    },

    async postStamp(stamp_id) {
      let self = this;
      if (self.videoId != "") {
        let url =
          "https://apiv5.openrec.tv/api/v5/movies/" + self.videoId + "/chats";
        let data = {
          stamp_id: stamp_id,
          consented_chat_terms: false,
          message: self.inputComment,
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
            uuid: self.orUuid,
            "access-token": self.orAccessToken,
          },
          body: JSON.stringify(data),
        };

        let j = await (await fetch(url, param)).json();
        self.inputComment = "";
        if (j.status != 0) {
          self.postError = j.message;
        } else {
          self.postError = "";
        }
      }
    },

    calc_speed() {
      let self = this;
      var sub = function () {
        self.commentsSpeed -= 1;
      };
      self.commentsSpeed += 1;
      setTimeout(sub, 120000);
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

input {
  padding: 0.2em;
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
  width: 60vw;
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
.post_box,
.url_box {
  color: var(--v-primary-base);
  background-color: var(--v-background-lighten1);
  border: 1px solid #a3a3a3;
}

.stamp_btn {
  margin-top: 5px;
  margin-left: 10px;
}
</style>
