<template>
  <div>
    <div>
      <div v-for="apigenre in apis" :key="apigenre.genre">
        <h2 class="genre">{{ apigenre.genre }}</h2>
        <div class="api-info" v-for="api in apigenre.data" :key="api.url">
          <h3>{{ api.desc }}</h3>
          <span>{{ api.method }}</span
          >:
          <code>{{ api.url }}</code>
          <v-btn
            @click="testfunc(api.method, api.url, api.param)"
            v-if="api.button"
            small
            outlined
            color="var(--v-primary-darken2)"
            >取得</v-btn
          >
          <div class="params">
            <span v-for="tag in Object.keys(api.param)" :key="tag">
              {{ tag }}: {{ api.param[tag] }}
              <br />
            </span>
          </div>
        </div>
      </div>
    </div>
    <modal-wrap v-show="showModal" :header="url" @close="closeModal">
      <pre>
        {{ resdata }}
      </pre>
    </modal-wrap>
  </div>
</template>

<script>
import orapi from "../assets/orapi.json";
import modalWrap from "../components/modalWrap";

export default {
  components: {
    modalWrap,
  },
  data() {
    return {
      apis: orapi,
      resdata: {},
      showModal: false,
      url: "",
    };
  },

  methods: {
    async testfunc(method, url, p) {
      this.showModal = true;
      this.url = url;
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
      let j = await (await fetch(url, param)).json();
      this.resdata = j;
    },

    closeModal() {
      this.showModal = false;
    },
  },
};
</script>

<style scoped>
code {
  font-family: Consolas, Menlo, Monaco, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Meiryo, monospace;
}

.genre {
  margin-top: 20px;
  margin-bottom: 10px;
}

.api-info {
  background-color: var(--v-info-darken1);
  border-radius: 10px;
  padding: 5px 0px 5px 10px;
  margin-top: 1em;
}

.params {
  font-family: Consolas, Menlo, Monaco, -apple-system, BlinkMacSystemFont,
    "Segoe UI", Meiryo, monospace;
  color: var(--v-primary-darken1);
  padding-left: 20px;
  padding-bottom: 0px;
}
</style>
