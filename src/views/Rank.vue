<template>
  <div>
    <Chart type="bar" :data="graphData" :options="chartOptions" />
    <br />

    <div>
      <div class="p-inputgroup">
        <InputNumber
          v-model="limit"
          :min="0"
          suffix="人"
          @keydown.enter="getRank"
        />
        <Dropdown
          v-model="selectedSpan"
          :options="spanArr"
          placeholder="年月"
          filterLocale="ja"
        />
        <Button
          :loading="nowloading"
          label="更新"
          class="p-button-outlined"
          @click="getRank"
        />
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <th width="10%">rank</th>
          <th>userid</th>
          <th>count</th>
        </thead>
        <tbody>
          <tr v-for="(item, index) in graphData.labels" :key="index">
            <td>{{ index + 1 }}</td>
            <td>
              <span
                @click="showUserCard(graphData.userid[index])"
                style="text-decoration: underline; cursor: pointer"
              >
                {{ item }}
              </span>
            </td>
            <td>{{ graphData.datasets[0].data[index] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <Dialog
      v-model:visible="showModal"
      :modal="true"
      :dismissableMask="true"
      header="ユーザ情報"
    >
      <UserCardVue :userid="modalUserid" />
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Chart from "primevue/chart";
import InputNumber from "primevue/inputnumber";
import { useToast } from "primevue/usetoast";
import UserCardVue from "../components/UserCard.vue";

const limit = ref(30);
const spanArr = ref([]);
const selectedSpan = ref(null);
const nowloading = ref(false);
const showModal = ref(false);
const modalUserid = ref("");
const graphData = ref({
  labels: [],
  datasets: [
    {
      backgroundColor: "#eee",
      data: [],
    },
  ],
  userid: [],
});
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#ddd",
      },
      grid: {
        display: false,
      },
    },
    y: {
      ticks: {
        color: "#ddd",
      },
      grid: {
        color: "#666",
      },
    },
  },
});
const toast = useToast();

onMounted(() => {
  const getDoubleDigestNumber = (num) => {
    return ("0" + num).slice(-2);
  };

  let dt = new Date();
  let y = 2020;
  let m = 7;
  let deadline = [];
  if (dt.getMonth() === 11) {
    deadline.push(dt.getFullYear() + 1);
  } else {
    deadline.push(dt.getFullYear());
  }
  deadline.push((dt.getMonth() + 2) % 12);

  for (; y !== deadline[0] || m !== deadline[1]; ) {
    let ym = y + getDoubleDigestNumber(m);
    spanArr.value.push(ym);
    if (m === 12) {
      y++;
    }
    m = (m % 12) + 1;
  }
  spanArr.value.push("all");
  spanArr.value = spanArr.value.reverse();
  selectedSpan.value = spanArr.value[1];
  getRank();
});

const getRank = async () => {
  let rankApi =
    "https://asia-northeast1-futonchan-openchat.cloudfunctions.net/api/v2/rank";
  let res;
  nowloading.value = true;
  if (limit.value === null) {
    limit.value = 30;
  }

  if (selectedSpan.value === "all") {
    res = await fetch(`${rankApi}/all?limit=${limit.value}`);
  } else {
    let y = selectedSpan.value.slice(0, 4);
    let m = selectedSpan.value.slice(-2);
    res = await fetch(`${rankApi}/${y}/${m}?limit=${limit.value}`);
  }
  if (res.ok) {
    let j = await res.json();
    let tempIds = [];
    let tempCount = [];
    let tempNicknames = [];
    for (let data of j) {
      if (data["nickname"]) {
        tempNicknames.push(data["nickname"]);
      } else {
        tempNicknames.push(data["userid"]);
      }
      tempIds.push(data["userid"]);
      tempCount.push(data["count"]);
    }
    graphData.value.userid = tempIds;
    graphData.value.labels = tempNicknames;
    graphData.value.datasets[0].data = tempCount;
  } else {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: res.status + ": Failed to get msg",
      life: 3000,
    });
  }
  nowloading.value = false;
};

const showUserCard = (userid) => {
  showModal.value = true;
  modalUserid.value = userid;
};
</script>

<style scoped>
.p-chart {
  position: relative;
  height: 40vh;
  width: 90vw;
}

.table-wrap {
  overflow-x: scroll;
}
.table-wrap::-webkit-scrollbar {
  width: 8px;
}
.table-wrap::-webkit-scrollbar-thumb {
  background-color: var(--surface-a);
}
.table-wrap::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}
</style>
