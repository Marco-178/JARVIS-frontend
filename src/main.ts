import { createApp } from 'vue'
import App from './App.vue'
import router from './routes';
import { createPinia } from 'pinia';

import 'bootstrap/dist/js/bootstrap.min.js';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/main.css';


const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.mount('#app');

