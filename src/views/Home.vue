<template>
  <div class="masaoroid">
    <h1>Masaoroid</h1>
    <Button
      :loading="nowloading"
      label="再生成"
      aria-label="再生成"
      class="p-button-outlined"
      @click="getMasaoMessage()"
    />
    <Button
      icon="pi pi-copy"
      label="コピー"
      aria-label="コピー"
      class="p-button-outlined"
      @click="copyMessage()"
    />

    <div>
      <div class="masao-face">{{ face }}</div>
      <div class="masao-msg">
        <p>{{ message }}</p>
        <p class="warn">※本人の発言ではありません</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "primevue/usetoast";

const message = ref("loading...");
const face = ref("( ･᷄෴･᷅.)");
const nowloading = ref(true);
const toast = useToast();
const faceList = [
  "( ᴖ෴ᴖ.)", "( ･᷄෴･᷅.)", "( ･᷅෴･᷄.)", "(৹ ˃෴˂.৹)",
  "(  ⌯᷄︎෴⌯᷅︎ .)", "( ///෴///.)", "(⃔ ･᷄෴･᷅.)⃕↝", "( థ෴థ．)",
  "(´-෴-.)", "癶( ･᷄෴･᷅.癶)"
]

onMounted(() => {
  getMasaoMessage();
});

const getMasaoMessage = async () => {
  let url =
    "https://asia-northeast1-futonchan-openchat.cloudfunctions.net/masaoroid";
  nowloading.value = true;
  let res = await fetch(url);
  nowloading.value = false;
  if (res.ok) {
    message.value = await res.text();
    face.value = faceList[Math.floor(Math.random() * faceList.length)];
  } else {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: "Failed to get msg",
      life: 3000,
    });
  }
};

const copyMessage = async () => {
  let msg = `${face.value}「${message.value}」`;
  try {
    await navigator.clipboard.writeText(msg);
    toast.add({
      severity: "info",
      summary: "Copied!",
      life: 3000,
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "Failed to copy.",
      life: 3000,
    });
  }
};
</script>

<style scoped>
.masaoroid {
  position: absolute;
  width: 80vw;
  height: 80vh;
  top: 40%;
  left: 50%;
  margin-left: -40vw;
  margin-top: -20vh;
  text-align: center;
}

.masaoroid > div {
  font-size: 30px;
}

.masao-msg {
  position: relative;
  display: inline-block;
  background-color: transparent;
  border: solid 5px var(--primary-color);
  padding: 16px;
  min-width: 240px;
  width: 50%;
  text-align: center;
  border-radius: 5px;
}
.masao-msg::before {
  content: "";
  position: absolute;
  border: solid 12px transparent;
  border-bottom: solid 12px var(--primary-color);
  top: -24px;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
}
.masao-msg p {
  margin: 0;
}
.masao-msg .warn {
  font-size: 10px;
  text-align: left;
}

.masao-face {
  margin: 10px 0px;
}
</style>
