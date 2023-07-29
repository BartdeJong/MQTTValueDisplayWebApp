import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './registerServiceWorker';
import store from './store';
import Ionic from '@ionic/vue';
import 'materialize-css';
import 'materialize-css/dist/css/materialize.css';
import { eventBus } from './eventBus.js';
import Fragment from 'vue-fragment';

Vue.config.productionTip = false;
Vue.use(Ionic);
Vue.use(Fragment.Plugin);

// Create the Vue instance with the necessary configurations
const app = new Vue({
  router,
  store,
  render: h => h(App)
});

// Mount the Vue instance to the #app element
app.$mount('#app');

// Set the event bus as a global property on the Vue prototype
Vue.prototype.$eventBus = eventBus;
