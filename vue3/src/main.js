import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";

import PrimeVue from "primevue/config";
import Button from "primevue/button";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import Sidebar from "primevue/sidebar";

// import "primevue/resources/themes/arya-blue/theme.css";
import "@/style/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

const app = createApp(App);
app.use(router);
app.use(PrimeVue);
app.use(ToastService);

app.component("Button", Button);
app.component("Toast", Toast);
app.component("Sidebar", Sidebar);

app.mount("#app");
