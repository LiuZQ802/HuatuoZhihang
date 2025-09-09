import { createApp } from 'vue'
import 'vfonts/FiraCode.css'
import store from './store'
import router from './router'
import naive from 'naive-ui'
import 'highlight.js/styles/github.css'
import "leaflet/dist/leaflet.css";
import App from './App.vue'

const app = createApp(App)
app.use(router).use(store).use(naive)
app.mount('#app')
