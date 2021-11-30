<template>
  <div>
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
            <v-text-field
              type="number"
              min="1"
              v-model.number="limit"
              label="表示人数"
              suffix="人"
              hide-details
              dense
              outlined
            ></v-text-field>
            <v-select
              v-model="tempYm"
              :items="ymObj"
              label="年月"
              hide-details
              dense
              outlined
              return-object
            ></v-select>
          </v-row>
        </form>
      </div>
      <v-btn
        id="update-button"
        outlined
        @click="createGraphData()"
        color="var(--v-primary-darken2)"
        >更新</v-btn
      >
    </div>

    <div>
      <div class="table_wrap">
        <table>
          <thead>
            <th width="5%">rank</th>
            <th width="20%">userid</th>
            <th>count</th>
          </thead>
          <tbody>
            <tr v-for="(item, index) in graphData.labels" :key="index">
              <td>{{ index + 1 }}</td>
              <td>
                <span @click="clickUser(item)" class="userid">{{ item }}</span>
              </td>
              <td>{{ graphData.datasets[0].data[index] }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <graphModal
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
import graphModal from "../components/graphModal";

export default {
  components: {
    barChart,
    graphModal,
  },

  data() {
    return {
      // new input value
      limit: 30,
      ymObj: [],
      tempYm: { text: "", value: "" },

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
              },
            },
          ],

          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                fontColor: "#ddd",
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
    // create ym list
    let dt = new Date();
    let y = 2020;
    let m = 7;

    for (; y !== dt.getFullYear() || m !== (dt.getMonth() + 2) % 12; ) {
      let ym = y + this.getDoubleDigestNumber(m);
      this.ymObj.push({ text: ym, value: ym });
      if (m === 1) {
        y++;
      }
      m = (m % 12) + 1;
    }
    this.tempYm = this.ymObj[this.ymObj.length - 1];

    this.ymObj.push({ text: "all", value: "all" });
    this.ymObj = this.ymObj.reverse();
    // init graph data
    this.createGraphData();
  },

  methods: {
    async clickUser(userid) {
      let orApiUrl =
        "https://public.openrec.tv/external/api/v5/channels/" + userid;
      let webappApiUrl =
        "https://asia-northeast1-futonchan-openchat.cloudfunctions.net/api/v2/rank/user/" +
        userid;
      let tempGraphData = {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: "#0288D1",
            hoverBackgroundColor: "#03A9F4",
          },
        ],
      };

      this.showModal = true;

      // while fetching
      this.postData["nickname"] = "now loading";
      this.postData["id"] = "now loading";
      this.postData["created_at"] = "now loading";

      const [res1, res2] = await Promise.all([
        fetch(orApiUrl),
        fetch(webappApiUrl),
      ]);
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
        let data = await res2.json();

        tempGraphData["labels"] = Object.keys(data);
        for (let i of tempGraphData["labels"]) {
          tempGraphData["datasets"][0]["data"].push(data[i]);
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

    async createGraphData() {
      let ids = [];
      let counts = [];
      let rankApi =
        "https://asia-northeast1-futonchan-openchat.cloudfunctions.net/api/v2/rank";
      let res;
      if (this.tempYm["value"] == "all") {
        res = await fetch(`${rankApi}/all?limit=${this.limit}`);
      } else {
        let y = this.tempYm["value"].slice(0, 4);
        let m = this.tempYm["value"].slice(-2);

        res = await fetch(`${rankApi}/${y}/${m}?limit=${this.limit}`);
      }
      if (res.status == 200) {
        let j = await res.json();
        for (let data of j) {
          ids.push(data["userid"]);
          counts.push(data["count"]);
        }
        this.updataGraph(ids, counts);
      }
    },
  },
};
</script>

<style scoped>
#update-button {
  margin-left: 20px;
  margin-bottom: 14px;
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
  margin-bottom: 10px;
}

.row {
  margin-bottom: 3px;
}

.userid {
  text-decoration: underline;
}
.userid:hover {
  color: var(--v-secondary-base);
}

.table_wrap {
  overflow: scroll;
}
table {
  width: 90%;
  min-width: 400px;
  margin-top: 10px;
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

.v-text-field {
  max-width: 120px;
}
</style>
