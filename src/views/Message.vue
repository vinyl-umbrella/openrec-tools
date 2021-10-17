<template>
  <div class="explore">
    <h1>おぷちゃ過去ログ検索システム</h1>
    <div class="container">
      <v-select v-model="tempVideoid" :items="videoIdObj" label="枠" dense outlined return-object ></v-select>
      <v-text-field type="string" v-model.trim="userid" label="ユーザID(任意)" dense outlined @keydown.enter="getMessages(0)"></v-text-field>
      <v-text-field type="string" v-model="search_string" label="検索ワード(任意)" dense outlined @keydown.enter="getMessages(0)"></v-text-field>
      <v-text-field type="string" v-model="startdate" label="検索開始日時(任意)" dense outlined @keydown.enter="getMessages(0)"></v-text-field>
      <v-btn @click="getMessages(0)" color="var(--v-background-lighten1)" depressed>取得</v-btn>
    </div>
    <div class="table_wrap">
      <table>
        <thead>
          <th width=20%>time</th>
          <th width=20%>userid</th>
          <th>message</th>
        </thead>
        <tbody>
          <tr v-for="(item, index) in messages" :key="index">
            <td>{{ item.time | timeFormat }}</td>
            <td>
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <span v-on="on" v-on:mouseover="getUserData(item.userid)">{{ item.userid}}</span>
                </template>
                <div>
                  <img :src="userinfo.icon" width="35px"/>
                  <span>{{ userinfo.nickname }}({{ item.userid }})</span>
                </div>
              </v-tooltip>
            </td>
            <td>{{ item.message }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <span v-if="messages.length > 49">
      <v-btn @click="getMessages(lastid)" class="nextbtn" color="#2e2c37">次の50件</v-btn>
    </span>
    <br><br><br>
  </div>
</template>

<script>
import videoIdObj from '../assets/videoid.json'

export default {
  data() {
    return {
      videoIdObj: videoIdObj,
      tempVideoid: {text: "おぷちゃ3", value: "n9ze3m2w184"},
      messages: [],
      userid: "",
      search_string: "",
      startdate: "",
      enddate: "",
      lastid: 0,
      userinfo: {icon: "", nickname: ""}
    };
  },

  filters: {
    timeFormat: function (t) {
      const regex = /(\d\d\d\d-\d\d-\d\d)T(\d\d:\d\d:\d\d).*/i;
      return t.replace(regex, "$1 $2");
    },
  },

  methods: {
    async getUserData(userid) {
      let url = `https://public.openrec.tv/external/api/v5/channels/${userid}`;
      let j = await (await fetch(url)).json();
      this.userinfo.icon = j.l_icon_image_url;
      this.userinfo.nickname = j.nickname;
    },

    async getMessages(last) {
      const url =
        "https://asia-northeast1-futonchan-openchat.cloudfunctions.net/api/v1/messages";
      let postdata = {
        videoid: this.tempVideoid["value"],
        userid: this.userid,
        search_string: this.search_string,
        startdate: this.startdate,
        enddate: this.enddate,
        border: last,
      };

      let res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(postdata),
      });

      if (res.ok) {
        let j = await res.json();
        if (j.length == 0) {
          this.messages = [{ time: "", userid: "", message: "no result" }];
          return;
        }
        window.scroll({top: 0, behavior: 'smooth'})
        this.messages = j;
        this.lastid = j[j.length - 1]["id"];
      }
    },
  },
};
</script>

<style scoped>
.explore {
  margin-left: 2%;
  margin-right: 2%;
}

.table_wrap {
  overflow: scroll;
}
table {
  width: 90%;
  min-width: 600px;
  margin-left: auto;
  margin-right: auto;
  border-collapse: collapse;
  border: solid 3px var(--v-background-lighten5);
}

table th,
table td {
  /* width: 33%; */
  border: solid 1px var(--v-background-lighten5);
  padding: 6px;
}

.container {
  display: flex;
  margin-left: 0;
}

.v-text-field {
  margin-right: 6px;
  max-width: 300px;
}

.nextbtn {
  float: right;
  margin-top: 10px;
  margin-right: 5%;
}
</style>
