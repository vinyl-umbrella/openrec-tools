<template>
  <div id="app">
    <title>openchat rank</title>
    <header>
      <h1>openchat rank</h1>
      <nav>
        <div>最終更新日 2021年3月25日</div> <!-- 注目 -->
        <div>
          保管庫は
          <a
            href="https://drive.google.com/drive/folders/1U77WomTyFEVtFtA4gMQKUJf8gdXRijP8?usp=sharing"
            >ここ</a
          >
        </div>
      </nav>
    </header>

    <bar-chart
      id="mainChart"
      :chart-data="graphData"
      :options="options"
      :height="chartHeight"
      :width="chartWidth"
    ></bar-chart>
    <div class="flex-box">
      <div class="flex-items">
        <form>
          <div>
            表示人数: <input type="number" min="1" max="1000" v-model="num" />
          </div>
          <div>
            開始年月:
            <input type="number" min="2020" max="2021" v-model="startYear" />
            <input type="number" min="1" max="12" v-model="startMonth" />
          </div>
          <div>
            終了年月:
            <input type="number" min="2020" max="2021" v-model="endYear" />
            <input type="number" min="1" max="12" v-model="endMonth" />
          </div>
        </form>
      </div>
      <div @click="createGraphData()" id="update-button"><p>更新</p></div>
    </div>
    <div>{{ inputErrMsg }}</div>

    <div>
      <p v-for="(item, index) in graphData.labels" :key="index">
        {{ index + 1 }}. &nbsp;
        <span @click="clickUser(item)" class="userid">{{ item }}</span>
        &nbsp; {{ graphData.datasets[0].data[index] }}
      </p>
      <modal
        :val="postData"
        :chartData="modalGraphData"
        :chartOptions="options"
        v-show="showModal"
        @close="closeModal()"
      />
    </div>
  </div>
</template>

<script>
import barChart from "./components/barChart";
// import firebase from "firebase";
import firebase from "firebase/app"
import "firebase/firestore"
import Modal from "./components/modal";
const firebaseConfig = require("./secret.json");
firebase.initializeApp(firebaseConfig);

export default {
  components: {
    barChart,
    Modal,
  },

  data() {
    return {
      // modal
      showModal: false,
      postData: {
        id: "",
        nickname: "",
      },
      modalGraphData: {
        labels: [],
        datasets: [
          {
            data: [],
          },
        ],
      },
      // input
      num: 30,
      startYear: 2021,
      startMonth: 3,    // 注目
      endYear: 2021,
      endMonth: 3,      // 注目
      // 入力エラー
      inputErrMsg: "",
      // グラフの描画に使用するデータ
      graphData: {
        labels: [],
        datasets: [
          {
            data: [],
          },
        ],
      },
      options: {
        legend: {
          display: false,
        },
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
      chartHeight: window.innerHeight * 0.35,
      chartWidth: window.innerWidth * 0.8,
    };
  },

  mounted() {
    this.createGraphData();
  },

  methods: {
    async clickUser(userid) {
      let url = "https://public.openrec.tv/external/api/v5/channels/" + userid;
      const res = await fetch(url);
      if (res.ok) {
        let j = await res.json();
        this.postData["id"] = j["id"];
        this.postData["nickname"] = j["nickname"];
      } else {
        this.postData["id"] = userid;
      }

      let temp = {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: "rgb(178, 178, 255)",
            hoverBackgroundColor: "rgb(127, 127, 255)",
          },
        ],
      }
      // 注目
      temp["labels"] = ["2020-7", "2020-8", "2020-9", "2020-10", "2020-11", "2020-12", "2021-1", "2021-2", "2021-3"];
      for (let i of temp["labels"]) {
        let ym = i.split("-");
        const doc = await this.getFromFirestore(ym[0], ym[1]);
        if (doc[userid]) {
          temp["datasets"][0]["data"].push(doc[userid]);
        } else {
          temp["datasets"][0]["data"].push(0);
        }
      }
      // obj を丸ごと変更するとグラフに反映される
      this.modalGraphData = temp;
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
    },

    // ラベルとそのデータを用いてグラフを更新
    updataGraph(label, data) {
      this.graphData = {
        labels: label,
        datasets: [
          {
            data: data,
            backgroundColor: "rgb(178, 178, 255)",
            hoverBackgroundColor: "rgb(127, 127, 255)",
          },
        ],
      };
    },

    // 数字を0付き2桁の文字列に変換
    getDoubleDigestNumber(num) {
      return ("0" + num).slice(-2);
    },

    // 入力年月をチェック
    checkYearMonth() {
      if (this.startYear >= 2020 && this.startYear <= 2021) {
        if (this.endYear >= 2020 && this.endYear <= 2021) {
          if (this.startMonth >= 1 && this.startMonth <= 12) {
            if (this.endMonth >= 1 && this.endMonth <= 12) {
              if (
                Number(
                  String(this.endYear) +
                    this.getDoubleDigestNumber(this.endMonth)
                ) >=
                Number(
                  String(this.startYear) +
                    this.getDoubleDigestNumber(this.startMonth)
                )
              ) {
                this.inputErrMsg = "";
                return true;
              }
            }
          }
        }
      }
      this.inputErrMsg = "入力値エラー";
      return false;
    },

    async getFromFirestore(year, month) {
      const db = firebase.firestore();

      try {
        const doc = await db.collection(String(year)).doc(String(month)).get();
        if (doc.empty) {
          console.log("no data");
          return {};
        }
        return doc.data();
      } catch (err) {
        console.log("firestore err while getting data:", err);
      }
    },

    async createGraphData() {
      if (this.checkYearMonth()) {
        let ids = [];
        let counts = [];
        let graphDataObj = {};
        let yearMonth = [];
        let y = Number(this.startYear);
        let m = Number(this.startMonth);

        // 取得するyear, monthを格納した配列を生成
        while (
          Number(
            String(this.endYear) + this.getDoubleDigestNumber(this.endMonth)
          ) >= Number(String(y) + this.getDoubleDigestNumber(m))
        ) {
          yearMonth.push([y, m]);
          if (m == 12) {
            y += 1;
            m = 1;
          } else {
            m += 1;
          }
        }

        for (let elem of yearMonth) {
          // console.log(elem);
          // 各月のデータを取得
          let doc = await this.getFromFirestore(elem[0], elem[1]);

          // 存在するなら加算 else 追加
          for (let key of Object.keys(doc)) {
            if (graphDataObj[key]) {
              graphDataObj[key] += Number(doc[key]);
            } else {
              graphDataObj[key] = Number(doc[key]);
            }
          }
        }

        // idとcountペアの配列をpush
        let tempArray = [];
        for (let key of Object.keys(graphDataObj)) {
          tempArray.push([key, graphDataObj[key]]);
        }
        // ソートする
        tempArray.sort(function (a, b) {
          return b[1] - a[1];
        });

        // カット
        let n = Math.min(tempArray.length, this.num);
        tempArray = tempArray.slice(0, n);

        // id と count の配列に分ける
        for (let i of tempArray) {
          ids.push(i[0]);
          counts.push(i[1]);
        }

        this.updataGraph(ids, counts);
      }
    },
  },
};
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500&display=swap');
#app {
  font-family: 'Noto Sans JP', sans-serif;
  font-weight: 500;
}

header {
  padding: 5px 4% 5px;
  position: fixed;
  top: 0;
  width: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
}
nav {
  margin-left: auto;
  margin-right: 100px;
}

input {
  width: 5em;
}

#mainChart {
  margin-top: 150px;
}

.flex-box {
  display: flex;
  align-items: flex-end;
  border-top: dotted 2px #444;
  border-bottom: dotted 2px #444;
}
.flex-items {
  margin: 10px;
}

#update-button {
  cursor: pointer;
  width: 80px;
  text-align: center;
  background: #eee;
  color: #444;
  border-top: solid 2px #444;
  border-left: solid 2px #444;
  border-right: solid 2px #444;
  border-bottom: solid 4px #444;
  border-radius: 2px;
}
#update-button:active {
  background: #ccc;
  color: #444;
}

.userid {
  text-decoration: underline;
}
.userid:hover {
  color: red;
}
</style>
