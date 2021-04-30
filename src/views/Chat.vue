<template>
  <div class="chat">
    <div class="flexbox">
      <div id="inputUrl">
        URL:
        <input
          type="text"
          v-model="inputUrl"
          placeholder="openrec url"
          style="width: 300px"
          @keydown.enter="getComment"
        />
        <a class="btn" @click="getComment">接続&nbsp;</a>
        <span>{{ urlError }}</span>
      </div>
      <img id="configBtn" src="../assets/conf.png" height="24px" width="24px" v-on:click="callModal()" />
    </div>

    <div class="stream_data">
      <div class="title">
        <a :href="inputUrl" target="_blank">{{ title }}</a>
      </div>
      <div class="channel_name">{{ channelName }}</div>
      <br />

      <div>
        <span>同接: {{ viewers }}&nbsp;</span>
        <span>最大同接: {{ max_viewers }}&nbsp;</span>
        <span>コメ速: {{ calcAvg }}/min</span>
      </div>
    </div>

    <div class="flexbox">
      <div id="comment_box" class="comment_box">
        <div class="comments" v-for="(comment, index) in comments" :key="index">
          <div class="user_name">{{ comment.Name }}</div>
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
          <span>[{{ event.type}}]&nbsp;</span>
          <span v-if="event.type=='URL'">
            <a :href="event.content" target="_blank">{{ event.content }}</a>
          </span>
          <span v-else>
            {{ event.content}}
          </span>
        </div>
      </div>
    </div>
    <input
      type="text"
      v-model="inputComment"
      class="post_box"
      placeholder="コメント"
      style="width: 400px"
      @keydown.enter="postComment"
    />
    <a class="btn" @click="postComment">post</a>
    <span>{{ inputComment.length }}/100</span><br />
    <span>{{ postError }}</span>

    <!-- modal -->
    <div id="overlay" v-show="showModal" @click.self="closeModal()">
      <div id="content">
        <div v-if="!isLogin">
          <form autocomplete="on">
            <input type="text" placeholder="uuid" v-model="orUuid" style="width: 90%;" />
            <input type="password" placeholder="access-token" v-model="orAccessToken" style="width: 90%;"/>
          </form><br>
          <button @click="closeModal()">cancel</button>
          <button @click="orLogin()">Login</button>
        </div>
        <div v-else>
          <h2>Config</h2>
          <div>
            チャット保持件数<input type="number" v-model="maxCommentNum">
          </div>
          <button @click="orLogout()">Logout</button>
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
      urlError: "",
      inputComment: "",
      postError: "",

      title: "",
      channelName: "",
      viewers: 0,
      max_viewers: 0,
      comments_speed: 0,

      videoId: "",

      comments: [],
      maxCommentNum: 100,
      events: [],
      wsConnectFlag: false,
    };
  },

  computed: {
    calcAvg() {
      return parseInt(this.comments_speed / 2);
    },
  },

  mounted() {
    this.updateLoginStatus();
  },

  methods: {
    updateLoginStatus() {
      let getCookieArray = () => {
        let arr = new Array();
        if(document.cookie != ""){
          let tmp = document.cookie.split("; ");
          for(let i=0; i<tmp.length; i++){
            let data = tmp[i].split("=");
            arr[data[0]] = decodeURIComponent(data[1]);
          }
        }
        return arr;
      }

      let cookieArray = getCookieArray();

      if ((cookieArray["orUuid"] != "" && cookieArray["orAccessToken"] != "") && cookieArray["orUuid"] && cookieArray["orAccessToken"]){
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
      document.cookie = "orUuid=" + this.orUuid + "; path=/;  expires=" + expire + "; Secure;";
      document.cookie = "orAccessToken=" + this.orAccessToken + "; path=/;  expires=" + expire + "; Secure;";
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
      return (container.scrollHeight - container.scrollTop)*0.95 < container.clientHeight;
    },

    scrollToBottom(container) {
      container.scrollTop = container.scrollHeight;
    },

    async getMovieId() {
      let self = this;
      const URLHEAD = "https://www.openrec.tv/live/";
      let videoUrl = self.inputUrl;
      let videoId = "";
      if (videoUrl.indexOf(URLHEAD)) {
        self.urlError = "invalid url";
        return "";
      } else {
        self.urlError = "";
        if (videoUrl[videoUrl.length - 1] == "/") {
          videoUrl = videoUrl.slice(0, -1);
        }

        videoId = videoUrl.replace(URLHEAD, "");
        self.videoId = videoId;
        let apiUrl = "https://public.openrec.tv/external/api/v5/movies/" + videoId;
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
          console.log(e);
          self.urlError = "invalid url";
        }
        return movieId;
      }
    },

    async connectWS(url) {
      let self = this;
      let sock  = new WebSocket(url);
      sock.addEventListener("open", function() {
        console.log("-----CONNECT TO SERVER-----");
        self.wsConnectFlag = true;
      });

      sock.addEventListener("message", function(event) {
        if (event.data.length > 2) {
          let pos = event.data.indexOf("[");
          if (pos == 2) {
            let orig = JSON.parse(event.data.substr(pos));
            if(orig[0] == "message") {
              let j = JSON.parse(orig[1]);

              let addEvent = (type, content) => {
                let prms = new Promise((resolve) => {
                  const d = new Date();
                  let now = ("00" + (d.getMonth() + 1)).slice(-2) + "-" + ("00" + d.getDate()).slice(-2) + " " + ("00" + d.getHours()).slice(-2) + ":" + ("00" + d.getMinutes()).slice(-2) + ":" + ("00" + d.getSeconds()).slice(-2);
                  self.events.push({
                    "date": now,
                    "type": type,
                    "content": content,
                  });
                  resolve();
                })
                prms.then(() => {
                  self.scrollToBottom(document.getElementById("info_box"));
                })
              }
              switch(j.type) {
                // message
                case 0:
                  if (j.data.user_key != "") {
                    let name = j.data.user_name + " (" + j.data.user_key + ")";
                    if (j.data.user_type == 1) {
                      addEvent("chat", j.data.message);
                    }
                    if (j.data.yell != null) {
                      addEvent("yell", name + " " + j.data.yell.yells + " " + j.data.message);
                    }
                    if (j.data.badges.length != 0) {
                      name = name + "S";
                    }
                    if (j.data.is_premium) {
                      name = name + "P";
                    }

                    let result = j.data.message.match(/https?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+/)
                    if (result != null) {
                      addEvent("URL", result[0]);
                    }
                    let commentData = {"Name": name, "Message": j.data.message, "Stamp": ""};
                    if (j.data.stamp != null) {
                      commentData.Stamp = j.data.stamp.image_url;
                    }

                    let addComment = (data) => {
                      self.comments.push(data);
                      if (self.comments.length > self.maxCommentNum) {
                        self.comments.shift();
                      }
                    }

                    // 自動スクロール
                    let comment_box = document.getElementById("comment_box");
                    if (self.isBottom(comment_box)) {
                      let prms = new Promise((resolve) => {
                        addComment(commentData);
                        resolve();
                      })
                      prms.then(() => {
                        self.scrollToBottom(comment_box)
                      })
                    } else {
                      addComment(commentData);
                    }

                    self.calc_speed();
                  }
                  break;

                // 同接
                case 1:
                  self.viewers = j.data.live_viewers;
                  if (self.max_viewers < self.viewers) {
                      self.max_viewers = self.viewers;
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
                  addEvent("ban", "ban " + j.data.owner_to_banned_user_id);
                  break;

                // block 解除
                case 7:
                  addEvent("ban", "unban " + j.data.owner_to_banned_user_id);
                  break;

                // スタッフ権限付与
                case 8:
                  addEvent("staff", "staff " + j.data.owner_to_moderator_user_id);
                  break;

                // スタッフ権限解除
                case 9:
                  self.events.push({
                    "date": "00:24:21",
                    "content": "remove staff " + j.data.owner_to_moderator_user_id,
                  });
                  addEvent("staff", j.data.message);
                  break;

                // わからん refresh?
                case 10:
                  break;

                // ゲーム変更，タイトル変更
                case 11:
                  addEvent("info", j.data.system_message + " " + j.data.message);
                  break;

                // サブスク入会
                case 27:
                  addEvent("info", j.data.message);
                  break;

                // アンケート開始
                case 29:
                  j.data.votes.forEach(elem => {
                    addEvent("vote", elem.text);
                  });
                  break;

                // アンケート
                case 30:
                  console.log("type 30:", j);
                  break;

                // アンケート結果
                case 31:
                  j.data.votes.forEach(elem => {
                    addEvent("vote", elem.text + elem.count + "票 " + elem.ratio + "%");
                  });
                  break;

                default:
                  console.log("unknown type:", j);
              }
            } else {
              console.log("unknown format:", orig);
            }
          }
        }
      });

      // error
      sock.addEventListener("error", function(event) {
        console.error("ws error:", event);
      });

      // close
      sock.addEventListener("close", function(event) {
        console.log(event);
        console.log("-----BYE SERVER-----");
        self.wsConnectFlag = false;
        self.connectWS(url);
      })

      //なぜ"2"なのかはわからん
      var keepConnect = function() {
        sock.send("2");
      }
      setInterval(keepConnect, 25000);
    },

    async getComment() {
      let self = this;
      self.viewers = 0;
      self.max_viewers = 0;
      let movieId = await self.getMovieId();
      self.comments = [];
      if (movieId != "") {
        // current date
        const d = new Date();
        let now = d.getFullYear() + "-" + ("00" + (d.getMonth() + 1)).slice(-2) + "-" + ("00" + d.getDate()).slice(-2) + "T" + ("00" + d.getHours()).slice(-2) + ":" + ("00" + d.getMinutes()).slice(-2) + ":" + ("00" + d.getSeconds()).slice(-2) + "Z";

        // get past comment
        let url = "https://public.openrec.tv/external/api/v5/movies/" + self.videoId + "/chats?to_created_at=" + now;

        let past_comments = await (await fetch(url)).json();
        let prms = new Promise((resolve) => {
          for (let i = 0; i < past_comments.length; i++) {
            let name = past_comments[i].user.nickname + " (" + past_comments[i].user.id + ")";
            let comment = {
              Name: name,
              Message: past_comments[i].message,
              Stamp: "",
            };
            self.comments.push(comment);
          }
          resolve();
        })

        prms.then(() => {
          self.scrollToBottom(document.getElementById("comment_box"))
        })

        url = "wss://chat.openrec.tv/socket.io/?movieId=" + movieId + "&EIO=3&transport=websocket";
        if (!self.wsConnectFlag){
          self.connectWS(url);
        }
      }
    },

    async postComment() {
      let self = this;
      if (self.videoId != "" && self.inputComment != "" && self.isLogin) {
        let url = "https://apiv5.openrec.tv/api/v5/movies/" + self.videoId + "/chats";
        let data = {
          "message": self.inputComment,
          "quality_type": 2,
          "messaged_at": "",
          "league_key": "",
          "to_user_id": ""
        };
        let param = {
          method: "POST",
          headers: {
            "Accept": "application/json,text/plain,*/*",
            "Content-Type": "application/json;charset=utf-8",
            // "uuid": "",
            // "access-token": ""
            "uuid": self.orUuid,
            "access-token": self.orAccessToken
          },
          body: JSON.stringify(data)
        };

        let j = await (await fetch(url, param)).json();
        self.inputComment = "";
        if (j.status != 0) {
          self.postError = j.message;
        } else {
          self.postError = ""
        }
      }
    },

    calc_speed() {
      let self = this;
      var sub = function () {
        self.comments_speed -= 1;
      };
      self.comments_speed += 1;
      setTimeout(sub, 120000);
    },
  },
};
</script>

<style scoped>
a {
  color: #42b983;
}
.stream_data {
  border-top: dotted 2px #444;
  border-bottom: dotted 2px #444;
  margin-top: 5px;
  margin-bottom: 5px;
}

#configBtn {
  background-color: #ccc;
  border-radius: 18px;
  padding: 5px;
  margin-top: 2px;
  margin-left: auto;
  margin-right: 5px;

}
#configBtn:active {
  background-color: #aaa;
}

.btn {
  display: inline-block;
  padding: 0.2em 1.2em;
  margin-bottom: 7px;
  background: #ccc;
  color: #222;
  border-radius: 2px;
  font-size: smaller;
  margin-left: 3px;
  margin-right: 3px;
}
.btn:active {
  background: #aaa;
  color: #222;
}

.title a {
  font-size: 24px;
}

.channel_name {
  font-size: 20px;
}

.flexbox{
  display: flex;
}

.info_box, .comment_box {
  border: 2px solid #aaa;
  height: 60vh;
  max-width: 500px;
  border-radius: 3px;
  margin-left: 10px;
  padding: 10px;
  overflow-y: auto;
}
.comment_box {
  width: 60vw;
}
.info_box {
  width: 30vw;
}

.infos, .comments {
  margin: 1em;
  background-color: #f4f4f4;
  padding: 0.5em 8px;
  border-radius: 7px;
  word-break: break-all;
}

.user_name {
  font-size: smaller;
}

.post_box {
  margin-top: 20px;
  margin-left: 10px;
}
</style>
