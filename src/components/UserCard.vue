<template>
  <Card>
    <template #header>
      <Chart type="bar" :data="graphData" :options="chartOptions" />
    </template>
    <template #title>
      <a
        :href="`https://www.openrec.tv/user/${userInfo.id}`"
        target="_blank"
        rel="noopener norefferer"
      >
        <img :src="userInfo.icon" style="height: 1em; margin-right: 5px" />
        {{ userInfo.name }}
      </a>
      <a
        v-if="userInfo.twitter"
        class="pi pi-twitter"
        :href="`https://twitter.com/${userInfo.twitter}`"
        target="_blank"
        rel="noopener norefferer"
      />
    </template>
    <template #subtitle>{{ userInfo.id }}</template>
    <template #content>
      <div>登録日: {{ userInfo.date }}</div>
      <div>{{ userInfo.introduction }}</div>
    </template>
  </Card>
</template>

<script setup>
import { defineProps, onMounted, ref } from "vue";
import Card from "primevue/card";
import Chart from "primevue/chart";
import openrec from "@/func/openrec";
import { useToast } from "primevue/usetoast";

const props = defineProps({
  userid: String,
});
const userInfo = ref({
  id: "",
  name: "",
  icon: "",
  twitter: null,
  date: "",
  introduction: "",
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

onMounted(async () => {
  try {
    let info = await openrec.getUserInfo(props.userid);
    userInfo.value.id = info.id;
    userInfo.value.name = info.name;
    userInfo.value.twitter = info.twitter_screen_name;
    userInfo.value.date = info.registered_at.replace("T", " ").slice(0, -6);
    userInfo.value.introduction = info.introduction;

    if (info.icon_image_url) {
      userInfo.value.icon = info.icon_image_url;
    } else {
      userInfo.value.icon =
        "https://www.openrec.tv/viewapp/images/v4/default/profile.png";
    }
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: e,
      life: 3000,
    });
    userInfo.value.id = props.userid;
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
}

.p-card-title {
  display: flex;
  align-items: center;
}
</style>
