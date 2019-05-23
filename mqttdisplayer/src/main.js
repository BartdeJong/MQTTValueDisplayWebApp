import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './registerServiceWorker'
import store from './store'
import Ionic from '@ionic/vue'
import 'materialize-css'
import 'materialize-css/dist/css/materialize.css'

Vue.config.productionTip = false
Vue.use(Ionic);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
