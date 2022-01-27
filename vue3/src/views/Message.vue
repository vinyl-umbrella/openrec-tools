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
        <Calendar
          v-model="dt"
          dateFormat="yy-mm-dd"
          :showTime="true"
          placeholder="検索開始日時"
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
            <td>
              <span
                @click="showUserCard(item.userid)"
                style="text-decoration: underline; cursor: pointer"
              >
                {{ item.userid }}
              </span>
            </td>
            <td>{{ item.message }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <Button
      class="nextbtn p-button-outlined"
      label="次の50件"
      v-if="messages.length > 49"
      :loading="nowloading"
      @click="getMessages(lastid)"
    />
    <Dialog
      v-model:visible="showModal"
      :modal="true"
      :dismissableMask="true"
      header="ユーザ情報"
    >
      <UserCardVue :userid="modalUserid" />
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Calendar from "primevue/calendar";
import Dialog from "primevue/dialog";
import { useToast } from "primevue/usetoast";
import UserCardVue from "@/components/UserCard.vue";
import vid from "@/assets/vid.json";

const vidArr = ref(vid);
const selectedVid = ref({ text: "おぷちゃ3", value: "n9ze3m2w184" });
const userid = ref(null);
const searchString = ref(null);
const dt = ref(null);
const nowloading = ref(false);
const messages = ref([]);
const lastid = ref(0);
const toast = useToast();
const showModal = ref(false);
const modalUserid = ref("");

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
    startdate: dt.value,
    border: last,
  };
  if (dt.value) {
    let copiedDate = dt.value;
    copiedDate.setHours(copiedDate.getHours() + 9);
    copiedDate.setSeconds(0);
    postdata.startdate = copiedDate.toISOString().slice(0, -5);
  }

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

const showUserCard = (userid) => {
  showModal.value = true;
  modalUserid.value = userid;
};
</script>

<style scoped>
.table-wrap {
  overflow-x: scroll;
}

.nextbtn {
  float: right;
  margin-top: 10px;
}
</style>
