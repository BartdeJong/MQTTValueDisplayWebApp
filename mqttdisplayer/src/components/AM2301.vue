<template>
  <tr v-if="Message(topic) != null" class="found">
    <td>{{topic}}</td>
    <td>{{Message(topic).AM2301.Temperature}} &#8451;</td>
    <td>{{Message(topic).AM2301.Humidity}} %</td>
  </tr>
  <tr v-else class="notFound">
    <td>{{topic}}</td>
    <td>not</td>
    <td>found</td>
  </tr>
</template>

<script>
import MQTT from "@/components/mqtt";
import { mapGetters } from "vuex";

export default {
  name: "AM2301",
  props: ["topic"],
  data() {
    return {
      mqtt: null,
      broker: "wss://m24.cloudmqtt.com:36910",
      options: {
        clientId: this.getRandomClientId(),
        username: "gfvpvdvd",
        password: "UsI25cETE6yQ",
        topic: this.topic
      }
    };
  },
  created() {
	this.mqtt = new MQTT(this.broker, this.options);
  },
  computed: {
    ...mapGetters(["Message"])
  },
  methods: {
    getRandomClientId() {
      let string = "";
      for (let i = 0; i < 25; i++) {
        let char = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        string += char;
	  }
	  return string;
    }
  }
};
</script>

<style lang="scss">
	.notFound{
		background-color: #313131;
		color: #ee8484;
		// text-decoration: underline;
	}

	.found{
		background-color: #313131;
		color: #8ce265;
		font-weight: bold;
	}
</style>