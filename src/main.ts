import { createApp } from 'vue'
import App from './App.vue'
import router from './routes';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';

import './assets/main.css';

createApp(App).use(router).mount('#app')
