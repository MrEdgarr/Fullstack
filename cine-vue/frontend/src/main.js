import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

// Clear localStorage if it has been more than 24 hours since last access
const TWENTY_FOUR_HOURS = 5 * 60 * 1000;
const lastAccess = localStorage.getItem("app_last_access");
const now = Date.now();

if (lastAccess && now - parseInt(lastAccess, 10) > TWENTY_FOUR_HOURS) {
    localStorage.clear();
}
localStorage.setItem("app_last_access", now.toString());

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
