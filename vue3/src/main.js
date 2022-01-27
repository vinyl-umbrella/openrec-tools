import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";

import PrimeVue from "primevue/config";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";

import "@/style/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

const app = createApp(App);
app.use(router);
app.use(PrimeVue);
app.use(ToastService);

app.component("Button", Button);
app.component("Dialog", Dialog);
app.component("Dropdown", Dropdown);
app.component("InputText", InputText);
app.component("Toast", Toast);

app.mount("#app");
