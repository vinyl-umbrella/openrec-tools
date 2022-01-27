<template>
  <div>
    <div v-for="apiGenre in apis" :key="apiGenre.genre">
      <h2 class="genre">{{ apiGenre.genre }}</h2>
      <div class="api-info" v-for="api in apiGenre.data" :key="api.url">
        <Card>
          <template #header>
            <h3 style="margin: 0">{{ api.desc }}</h3>
          </template>
          <template #subtitle>
            <div style="display: flex; align-items: center">
              {{ api.method }}: {{ api.url }}
              <Button
                label="取得"
                v-if="api.button"
                class="p-button-outlined p-button-sm"
                @click="getApi(api.method, api.url, api.param)"
              />
            </div>
          </template>
          <template #content>
            <span
              v-for="tag in Object.keys(api.param)"
              :key="tag"
              class="params"
            >
              {{ tag }}: {{ api.param[tag] }}<br />
            </span>
          </template>
        </Card>
      </div>
    </div>
    <Dialog
      v-model:visible="showModal"
      :modal="true"
      :dismissableMask="true"
      header="APIレスポンス"
    >
      <pre>
        {{ jsonData }}
      </pre>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import openrecApi from "@/assets/openrecAPI.json";

const apis = ref(openrecApi);
const showModal = ref(false);
const jsonData = ref({});

const getApi = async (method, url, p) => {
  let param = {
    method: method,
    headers: {
      Accept: "application/json,text/plain,*/*",
      "Content-Type": "application/json;charset=utf-8",
      uuid: localStorage.getItem("orUuid"),
      "access-token": localStorage.getItem("orAccessToken"),
    },
  };
  if (method === "POST") {
    param.body = JSON.stringify(p);
  }
  showModal.value = true;
  jsonData.value = await (await fetch(url, param)).json();
};
</script>

<style scoped>
.api-info {
  background-color: var(--surface-b);
  border-radius: 10px;
  padding: 5px 0px 5px 10px;
  margin-top: 1em;
  word-break: break-all;
  line-height: 1.5;
}

.params {
  font-family: Consolas, Menlo, Monaco, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Meiryo, monospace;
  color: var(--text-color-secondary);
  padding-left: 20px;
  padding-bottom: 0px;
}
</style>
