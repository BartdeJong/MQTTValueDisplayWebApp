<template>
  <div class="toggle">
    <ion-item class="toggle">
      <ion-label>Display only</ion-label>
      <ion-toggle
        @ionChange="displayOnly = !displayOnly"
        v-bind:checked="displayOnly"
        color="dark"
      ></ion-toggle>
    </ion-item>
    <ion-card v-if="problem" class="problem">
      <ion-card-title class="problemText">The following problems have occured</ion-card-title>
      <ion-card-subtitle v-if="!isOnline" class="problemText">&#9632; Offline</ion-card-subtitle>
      <ion-card-subtitle v-if="!batteryCharging" class="problemText">&#9632; Not charging</ion-card-subtitle>
    </ion-card>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "problem",
  data() {
    return {
      hasProblem: false,
      isOnline: false,
      batteryCharging: false,
      displayOnly: false,
    };
  },
  computed: {
    ...mapGetters(["Message", "lastMessageTime"]),
    problem() {
      return this.displayOnly && (!this.isOnline || !this.batteryCharging);
    },
  },
  created() {
    setInterval(() => {
      this.online().then(response => {
        this.isOnline = response;
      });
      this.batteryStatus().then(response => {
        this.batteryCharging = response.charging;
      });
    }, 5000);
  },
  methods: {
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
    },
    batteryStatus() {
      return new Promise(resolve => {
        navigator.getBattery().then(response => {
          resolve(response);
        });
      });
    }
  }
};
</script>

<style lang="scss">
.problem {
  background-color: #b43131;
}

.problemText {
  color: #ffffff;
}

.toggle{
    background-color: #000000;
}
</style>