<template>
  <div class="home darkest">
    <ion-card v-if="problem()" class="problem">
      <ion-card-title class="problemText">The following problems have occured</ion-card-title>
      <ion-card-subtitle v-if="!isOnline" class="problemText">Offline</ion-card-subtitle>
    </ion-card>
	<ion-card-subtitle>{{lastMessageTime}}</ion-card-subtitle>
    <ion-card class="sizeUp">
      <table class="centered">
        <thead class="gray">
          <tr>
            <th>Location</th>
            <th>Temperature</th>
            <th>Humidity</th>
          </tr>
        </thead>
        <tbody>
          <AM2301 :topic="'CloudMQTT'"></AM2301>
          <AM2301 :topic="'Test1'"></AM2301>
          <AM2301 :topic="'Test2'"></AM2301>
          <AM2301 :topic="'Test3'"></AM2301>
        </tbody>
      </table>
    </ion-card>
  </div>
</template>

<script>
import MQTT from "@/components/mqtt";
import { mapGetters } from "vuex";
import AM2301 from "@/components/AM2301.vue";
import { Promise } from "q";
import { setInterval } from "timers";

export default {
  name: "home",
  data() {
    return {
      isOnline: false
    };
  },
  computed: {
    ...mapGetters(["Message", "lastMessageTime"])
  },
  components: {
    AM2301
  },
  created() {
    setInterval(() => {
      this.online().then(response => {
        this.isOnline = response;
      });
    }, 5000);
  },
  methods: {
    problem() {
      return !this.isOnline;
    },
    online() {
      return new Promise((resolve, reject) => {
        fetch("https://jsonplaceholder.typicode.com/todos/1")
          .then(response => {
            if (response.status == 200) resolve(true);
            else resolve(false);
          })
          .catch(() => {
            resolve(false);
          });
      });
    }
  }
};
</script>

<style lang="scss">
.sizeUp {
  font-size: large;
}

.gray {
  background-color: #313131;
  color: #a8a8a8;
}

.problem {
  background-color: #b43131;
}

.problemText {
  color: #ffffff;
}
</style>