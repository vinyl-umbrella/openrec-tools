<template>
  <div id="overlay" @click.self="$emit('close')">
    <div id="content" style="background-color: var(--v-background-base);">
      <p>{{ val.nickname }} ({{ val.id }})</p>
      <p style="color: var(--v-primary-darken3)">アカウント作成日時: {{ val.created_at }}</p>
      <!-- <p>{{ val.graphData }}</p> -->

      <bar-chart
        :chart-data="chartData"
        :options="chartOptions"
      ></bar-chart>
      <button @click="$emit('close')" style="background: var(--v-background-lighten2)">close</button>
    </div>
  </div>
</template>

<script>
import barChart from "./barChart";
export default {
  name: "Modal",
  props: ["val", "chartData", "chartOptions"],
  components: {
    barChart,
  },
};
</script>

<style>
#overlay {
  z-index: 1;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

#content {
  z-index: 2;
  width: 50%;
  padding: 1em 10% 1em 10%;
  text-align: center;
}

button {
  background-color: var(--v-background-lighten2);
  padding: 0.1em 0.5em;
}
</style>
