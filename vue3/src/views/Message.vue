<template>
  <div>
    <div>
      <div class="p-inputgroup">
        <Dropdown
          v-model="selectedVid"
          :options="vidArr"
          optionLabel="text"
          dataKey="value"
          placeholder="枠"
          :filter="true"
          filterLocale="ja"
        />
        <InputText
          type="text"
          v-model="userid"
          placeholder="ユーザID"
          @keydown.enter="getMessages(0)"
        />
        <InputText
          type="text"
          v-model="searchString"
          placeholder="検索ワード"
          @keydown.enter="getMessages(0)"
        />
        <InputText
          type="text"
          v-model="startDate"
          placeholder="検索開始日時"
          @keydown.enter="getMessages(0)"
        />
        <Button
          :loading="nowloading"
          label="取得"
          class="p-button-outlined"
          @click="getMessages(0)"
        />
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <th width="20%">datetime</th>
          <th width="20%">userid</th>
          <th>message</th>
        </thead>
        <tbody>
          <tr v-for="item in messages" :key="item.id">
            <td>{{ timeFormat(item.time) }}</td>
            <td>{{ item.userid }}</td>
            <td>{{ item.message }}</td>
          </tr>
        </tbody>
      </table>
      <Button
        class="nextbtn p-button-outlined"
        label="次の50件"
        v-if="messages.length > 49"
        :loading="nowloading"
        @click="getMessages(lastid)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "primevue/usetoast";
import vid from "@/assets/vid.json";

const vidArr = ref(vid);
const selectedVid = ref({ text: "おぷちゃ3", value: "n9ze3m2w184" });
const userid = ref(null);
const searchString = ref(null);
const startDate = ref(null);
const nowloading = ref(false);
const messages = ref([]);
const lastid = ref(0);
const toast = useToast();

const timeFormat = (t) => {
  const regex = /(\d\d\d\d-\d\d-\d\d)T(\d\d:\d\d:\d\d).*/i;
  return t.replace(regex, "$1 $2");
};

const getMessages = async (last) => {
  const url =
    "https://asia-northeast1-futonchan-openchat.cloudfunctions.net/api/v1/messages";
  let postdata = {
    videoid: selectedVid.value.value,
    userid: userid.value,
    search_string: searchString.value,
    startdate: startDate.value,
    border: last,
  };

  nowloading.value = true;
  let res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(postdata),
  });
  nowloading.value = false;

  if (res.ok) {
    let j = await res.json();
    if (j.length == 0) {
      toast.add({
        severity: "info",
        summary: "Failed",
        detail: "No result",
        life: 3000,
      });
    } else {
      if (last == 0) {
        messages.value = j;
      } else {
        messages.value = messages.value.concat(j);
      }
      lastid.value = j[j.length - 1]["id"];
    }
  } else {
    toast.add({
      severity: "error",
      summary: "Failed",
      detail: "Failed to get msg",
      life: 3000,
    });
  }
};
</script>

<style scoped>
.table-wrap {
  overflow-x: scroll;
}
table {
  width: 100%;
  min-width: 300px;
  border-collapse: collapse;
  border: solid 3px var(--primary-color);
  word-break: break-all;
}

table th,
table td {
  border: solid 1px var(--primary-color);
  padding: 6px;
}
.nextbtn {
  float: right;
  margin-top: 10px;
}
</style>
