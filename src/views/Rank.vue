<template>
  <div class="rank">
    <div class="info">
      <div>最終更新日 2021年8月2日</div> <!-- !!注目 -->
      <div>
        保管庫は
        <a
          href="https://drive.google.com/drive/folders/1U77WomTyFEVtFtA4gMQKUJf8gdXRijP8?usp=sharing"
          target="_blank"
          rel="noopener norefferer"
          >ここ</a
        >
      </div>
    </div>
    <h2>07-06 1:20:28 布団ちゃんにbanされた<br>まだ解除されない</h2>
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
          <v-row>
            <v-text-field type="number" min="1" max="1000" v-model.number="num" label="表示人数" dense outlined></v-text-field>
          </v-row>
          <v-row>
            <v-text-field type="number" min="2020" max="2021" v-model.number="startYear" label="開始年" dense outlined></v-text-field>
            <v-text-field type="number" min="1" max="12" v-model.number="startMonth" label="開始月" dense outlined></v-text-field>
          </v-row>
          <v-row>
            <v-text-field type="number" min="2020" max="2021" v-model.number="endYear" label="終了年" dense outlined></v-text-field>
            <v-text-field type="number" min="1" max="12" v-model.number="endMonth" label="終了月" dense outlined></v-text-field>
          </v-row>
        </form>
      </div>
      <v-btn @click="createGraphData()" id="update-button" depressed>更新</v-btn>
      <div>{{ inputErrMsg }}</div>
    </div>

    <div>
      <!-- user list -->
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
import barChart from "../components/barChart";
import Modal from "../components/modal";

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
        created_at: "",
      },
      modalGraphData: {
        labels: [],
        datasets: [
          {
            data: [],
          },
        ],
      },
      // input default value
      num: 30,
      startYear: 2021,
      startMonth: 7,    // !!注目
      endYear: 2021,
      endMonth: 7,      // !!注目
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
          xAxes: [
            {
              ticks: {
                fontColor: "#ddd",
              }
            }
          ],

          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                fontColor: "#ddd"
              },
            },
          ],
        },
      },
      chartHeight: window.innerHeight * 0.3,
      chartWidth: window.innerWidth * 0.8,
    };
  },

  mounted() {
    this.createGraphData();
  },

  methods: {
    async clickUser(userid) {
      let orApiUrl = "https://public.openrec.tv/external/api/v5/channels/" + userid;
      let webappApiUrl = "https://asia-northeast1-futonchan-openchat.cloudfunctions.net/api/v1/user/" + userid;
      let tempGraphData = {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: "#0288D1",
            hoverBackgroundColor: "#03A9F4",
          },
        ],
      }

      this.showModal = true;

      // while fetching
      this.postData["nickname"] = "now loading";
      this.postData["id"] = "now loading";
      this.postData["created_at"] = "now loading";

      const [res1, res2] = await Promise.all([fetch(orApiUrl), fetch(webappApiUrl)]);
      if (res1.ok) {
        let j = await res1.json();
        this.postData["id"] = j["id"];
        this.postData["nickname"] = j["nickname"];
        this.postData["created_at"] = j["registered_at"];
      } else {
        this.postData["id"] = userid;
        this.postData["nickname"] = "";
        this.postData["created_at"] = "account not found";
      }

      if (res2.ok) {
        let j = await res2.json();
        if (j.status == 1) {
          let ymKeys = Object.keys(j.data);
          let tempArray = [];
          let ym = [];
          for (let i of ymKeys) {
            tempArray.push(i.split("-"));
          }
          // sort y m
          tempArray.sort(function(a, b) {return a[1] - b[1];});
          tempArray.sort(function(a, b) {return a[0] - b[0];});

          for (let i of tempArray) {
            ym.push(i[0] + "-" + i[1]);
          }
          tempGraphData["labels"] = ym;
          for (let i of tempGraphData["labels"]) {
            tempGraphData["datasets"][0]["data"].push(j.data[i]);
          }
        }
      }

      // obj を丸ごと変更するとグラフに反映される
      this.modalGraphData = tempGraphData;
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
            backgroundColor: "#0288D1",
            hoverBackgroundColor: "#03A9F4",
          },
        ],
      };
    },

    // 数字を0付き2桁の文字列に変換
    getDoubleDigestNumber(num) {
      return ("0" + num).slice(-2);
    },

    // 入力年月をチェック
    // 注目
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

        let promiseArray = yearMonth.map(yearMonth => fetch(`https://asia-northeast1-futonchan-openchat.cloudfunctions.net/api/v1/ym/${yearMonth[0]}/${yearMonth[1]}`));

        Promise.all(promiseArray).then(res =>
          Promise.all(res.map(r => r.json()))
        ).then(jArr => {
          for(let j of jArr){
            let data = j.data;
            for (let key of Object.keys(data)) {
              if (graphDataObj[key]) {
                graphDataObj[key] += Number(data[key]);
              } else {
                graphDataObj[key] = Number(data[key]);
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
          if (this.num < 1) {
            this.num = 1;
          }
          let n = Math.min(tempArray.length, this.num);
          tempArray = tempArray.slice(0, n);

          // id と count の配列に分ける
          for (let i of tempArray) {
            ids.push(i[0]);
            counts.push(i[1]);
          }

          this.updataGraph(ids, counts);
        });
      }
    },
  },
}
</script>

<style scoped>
form div input {
  margin-bottom: 3px;
}

.info {
  text-align: right;
  margin-right: 10px;
}

.rank {
  margin-left: 10px;
}

.flex-box {
  display: flex;
  align-items: flex-end;
  border-top: dotted 2px var(--v-background-lighten3);
  border-bottom: dotted 2px var(--v-background-lighten3);
}
.flex-box .flex-items {
  margin-top: 20px;
  margin-left: 10px;
  margin-bottom: 20px;
}

.row {
  margin-bottom: -30px;
}

#update-button {
  margin-left: 20px;
  margin-bottom: 20px;
  background: var(--v-background-lighten1);
}

.userid {
  text-decoration: underline;
}
.userid:hover {
  color: var(--v-secondary-base);
}

.v-text-field{
  max-width: 100px;
}
</style>
