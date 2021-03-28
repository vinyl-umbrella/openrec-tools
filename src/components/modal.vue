<template>
  <div id="overlay">
    <div id="content">
      <p>{{ val.nickname }} ({{ val.id }})</p>
      <!-- <p>{{ val.graphData }}</p> -->

      <bar-chart
        :chart-data="chartData"
        :options="chartOptions"
      ></bar-chart>
      <button @click="$emit('close')">close</button>
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
  border: solid 2px;
}

#content {
  z-index: 2;
  width: 50%;
  background-color: rgb(250, 250, 250);
  padding: 1em 10% 1em 10%;
  text-align: center;
}

#content > img {
  width: 95%;
}
</style>
