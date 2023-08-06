import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import ManageLocations from "@/components/ManageLocations.vue"

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: "/manage-locations",
      name: "ManageLocations",
      component: ManageLocations
    },
  ]
})
