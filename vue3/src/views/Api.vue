<template>
  <div>
    <div v-for="apiGenre in apis" :key="apiGenre.genre">
      <h2 class="genre">{{ apiGenre.genre }}</h2>
      <div class="api-info" v-for="api in apiGenre.data" :key="api.url">
        <h3>{{ api.desc }}</h3>
        <span>{{ api.method }}</span
        >:
        <code>{{ api.url }}</code>
        <!-- <Button label="取得" /> -->
        <div class="params">
          <span v-for="tag in Object.keys(api.param)" :key="tag">
            {{ tag }}: {{ api.param[tag] }}
            <br />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import openrecApi from "@/assets/openrecAPI.json";

const apis = ref(openrecApi);
</script>

<style scoped>
.genre {
  margin-top: 10px;
  margin-bottom: 10px;
}

.api-info {
  background-color: var(--surface-b);
  border-radius: 10px;
  padding: 5px 0px 5px 10px;
  margin-top: 1em;
  word-break: break-all;
  line-height: 1.5;
}
.api-info > h3 {
  margin: 0;
}

.params {
  font-family: Consolas, Menlo, Monaco, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Meiryo, monospace;
  color: var(--text-color-secondary);
  padding-left: 20px;
  padding-bottom: 0px;
}
</style>
