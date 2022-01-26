<template>
  <Card>
    <template #header>
      <Chart type="bar" :data="graphData" :options="chartOptions" />
    </template>
    <template #title>
      <img :src="userInfo.icon" style="height: 1em; margin-right: 5px" />
      {{ userInfo.name }}
    </template>
    <template #subtitle>{{ userInfo.id }}</template>
  </Card>
</template>

<script setup>
import { defineProps, onMounted, ref } from "vue";
import Card from "primevue/card";
import Chart from "primevue/chart";
import openrec from "@/func/openrec";

const props = defineProps({
  userid: String,
});
const userInfo = ref({
  id: "",
  name: "",
  icon: "",
});
const graphData = ref({
  labels: [],
  datasets: [
    {
      backgroundColor: "#42A5F5",
      data: [],
    },
  ],
});
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  legend: {
    display: false,
  },
});

onMounted(async () => {
  let info = await openrec.getUserInfo(props.userid);
  userInfo.value.id = info.id;
  userInfo.value.name = info.name;
  if (info.l_icon_image_url) {
    userInfo.value.icon = info.l_icon_image_url;
  } else {
    userInfo.value.icon =
      "https://www.openrec.tv/viewapp/images/v4/default/profile.png";
  }
  let openchatApi = `https://asia-northeast1-futonchan-openchat.cloudfunctions.net/api/v2/rank/user/${props.userid}`;
  let res = await fetch(openchatApi);
  if (res.ok) {
    let openchatData = await res.json();
    let labels = [];
    let data = [];
    for (const key in openchatData) {
      labels.push(key);
      data.push(openchatData[key]);
    }
    graphData.value.labels = labels;
    graphData.value.datasets[0].data = data;
  }
});
</script>

<style>
.p-chart {
  position: relative;
  height: 30vh;
  min-width: 50vw;
}

.p-card-title {
  display: flex;
  align-items: center;
}
</style>
