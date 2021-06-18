<template>
  <div class="masaoroid">
    <h1>Masaoroid</h1>
    <div class="masao">
      <div class="masao-message">
        <p>{{ message }}</p>
        <p class="warn">※本人の発言ではありません</p>
      </div>
      <div class="masao-face">( ･᷄෴･᷅.)</div>
    </div>
    <v-btn @click="getMasaoMessage()" small depressed color="var(--v-background-lighten1)">再生成</v-btn>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "loading...",
    };
  },

  mounted() {
    this.getMasaoMessage();
  },

  methods: {
    async getMasaoMessage() {
      let url =
        "https://asia-northeast1-futonchan-openchat.cloudfunctions.net/masaoroid";
      let res = await fetch(url);
      if (res.ok) {
        this.message = await res.text();
      }
    },
  },
};
</script>

<style scoped>
.masaoroid {
  position: fixed;
  width: 80vw;
  height: 80vh;
  top: 50%;
  left: 50%;
  margin-left: -40vw;
  margin-top: -20vh;
  text-align: center;
}

.masao {
  font-size: 30px;
  text-align: center;
}

.masao-message {
  position: relative;
  display: inline-block;
  background-color: transparent;
  border: solid 5px var(--v-secondary-darken2);
  padding: 16px;
  min-width: 240px;
  max-width: 100%;
  text-align: center;
  border-radius: 5px;
}
.masao-message::before {
    content: "";
    position: absolute;
    border: solid 12px transparent;
    border-top: solid 12px var(--v-secondary-darken2);
    top: 100%;
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
}
.masao-message p {
    margin: 0;
    padding: 0;
}
.masao-message .warn {
  font-size: 10px;
  text-align: left;
}

.masao-face {
  margin: 10px 0px;
}
</style>
