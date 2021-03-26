<template>
  <div id="app">
    <title>openchat rank</title>
    <header>
      <h1>openchat rank</h1>
      <nav>
        <div>最終更新日 2021年3月25日</div>
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
      :chart-data="graphData"
      :options="options"
      :height="chartHeight"
      :width="chartWidth"
    ></bar-chart>
    <div class="flex-box">
      <div class="flex-items">
        <form name="form1">
          表示人数: <input type="number" min="1" max="1000" v-model="num" />
        </form>
        <form name="form2">
          開始年月:
          <input type="number" min="2020" max="2021" v-model="startYear" />
          <input type="number" min="1" max="12" v-model="startMonth" />
        </form>
        <form name="form3">
          終了年月:
          <input type="number" min="2020" max="2021" v-model="endYear" />
          <input type="number" min="1" max="12" v-model="endMonth" />
        </form>
      </div>
      <div @click="createGraphData()" id="update-button"><p>更新</p></div>
    </div>
    <div>{{ inputErrMsg }}</div>
    <br />

    <div>
      <p v-for="(item, index) in graphData.labels" :key="index">
        {{index+1}}. &nbsp;
        <a v-bind:href="`https://openrec.tv/user/${item}`" target="_blink">
          {{item}}
        </a>&nbsp;&nbsp;
        {{graphData.datasets[0].data[index]}}
      </p>
    </div>
  </div>
</template>

<script>
import barChart from "./components/barChart";
import firebase from "firebase";
const firebaseConfig = require("./secret.json");
firebase.initializeApp(firebaseConfig);

export default {
  components: {
    barChart,
  },

  data() {
    return {
      // input
      num: 30,
      startYear: 2021,
      startMonth: 2,
      endYear: 2021,
      endMonth: 2,
      // 入力エラー
      inputErrMsg: "",
      // グラフの描画に使用するデータ
      graphData: {
        labels: [],
        datasets: [
          {
            data: [],
          }
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
    // this.updataGraph([1, 2, 3, 4, 5], [5000, 200, 1500, 3000, 2500]);
    this.createGraphData();
  },

  methods: {
    // ラベルとそのデータを用いてグラフを更新
    updataGraph(label, data) {
      this.graphData = {
        labels: label,
        datasets: [
          {
            label: "count",
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
      } catch(err) {
        console.log("firestore err while getting data:", err);
      }
    },

    async createGraphData() {
      if(this.checkYearMonth()) {
        let ids = [];
        let counts = [];
        let graphDataObj = {};
        let yearMonth = [];
        let y = Number(this.startYear);
        let m = Number(this.startMonth);

        // 取得するyear, monthを格納した配列を生成
        while (Number(String(this.endYear) + this.getDoubleDigestNumber(this.endMonth)) >= Number(String(y) + this.getDoubleDigestNumber(m))) {
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
          for(let key of Object.keys(doc)) {
            if(graphDataObj[key]) {
              graphDataObj[key] += Number(doc[key]);
            } else {
              graphDataObj[key] = Number(doc[key]);
            }
          }
        }

        // idとcountペアの配列をpush
        let tempArray = []
        for(let key of Object.keys(graphDataObj)) {
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
        for(let i of tempArray) {
          ids.push(i[0]);
          counts.push(i[1])
        }

        this.updataGraph(ids, counts);
      }
    }
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

canvas {
  margin-top: 150px;
}

.flex-box {
  display: flex;
  align-items: flex-end;
}
.flex-items {
  margin: 10px;
}

#update-button {
  cursor: pointer;
  width: 100px;
  text-align: center;
  margin-top: 20px;
  background: #eee;
  color: #555;
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
</style>
