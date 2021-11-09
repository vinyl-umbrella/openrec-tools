<template>
  <modalWrap :header="val.nickname + '(' + val.id + ')'" @close="closeModal()">
    <p style="color: var(--v-primary-darken3)">
      アカウント作成日時: {{ this.parseDate }}
    </p>
    <bar-chart
      :chart-data="chartData"
      :options="chartOptions"
      :height="graphHeight"
    ></bar-chart>
  </modalWrap>
</template>

<script>
import barChart from "./barChart";
import modalWrap from "./modalWrap";

export default {
  name: "graphModal",
  props: ["val", "chartData", "chartOptions"],
  components: {
    barChart,
    modalWrap,
  },
  data() {
    return {
      graphHeight: window.innerHeight * 0.4,
    };
  },
  computed: {
    parseDate() {
      return this.val.created_at.replace("T", " ").slice(0, -6);
    },
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
  },
};
</script>
