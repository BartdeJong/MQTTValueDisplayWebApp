<template>
  <div class="home darkest">
    <problem/>
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
          <AM2301 :topic="'wemosd1'"></AM2301>
          <AM2301 :topic="'buiten'"></AM2301>
          <AM2301 :topic="'tuinkamer'"></AM2301>
          <!-- <AM2301 :topic="'Test3'"></AM2301> -->
        </tbody>
      </table>
    </ion-card>
	<clock></clock>
  </div>
</template>

<script>
import MQTT from "@/components/mqtt";
import { mapGetters } from "vuex";
import AM2301 from "@/components/AM2301.vue";
import problem from "@/components/problem.vue";
import clock from "@/components/clock.vue";
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
    AM2301,
    problem,
	clock
  },
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
</style>