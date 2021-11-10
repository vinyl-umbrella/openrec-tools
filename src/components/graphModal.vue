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
      graphHeight: window.innerHeight * 0.75 * 0.3,
    };
  },
  computed: {
    parseDate() {
      const regex = /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/;
      let match = this.val.created_at.match(regex);
      if (match) {
        return match[1] + " " + match[2];
      } else {
        return this.val.created_at;
      }
    },
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
  },
};
</script>
