<template>
  <tr v-if="Message(topic) != null" class="found" :class="{'notReceiving': isLongNoReceived}">
    <td>{{topic}}</td>
    <td class="largeText">{{Message(topic).AM2301.Temperature}} &#8451;</td>
    <td
      class="largeText"
    >{{Message(topic).AM2301.Humidity}} %</td>
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
		isLongNoReceived: false,
      mqtt: null,
      // broker: "wss://m24.cloudmqtt.com:36910",
      // options: {
      //   clientId: this.getRandomClientId(),
      //   username: "gfvpvdvd",
      //   password: "UsI25cETE6yQ",
      //   topic: this.topic
      // }
      broker: "ws://217.120.19.8:1884",
      options: {
        clientId: this.getRandomClientId(),
        username: "local-user",
        password: "Brt.1234",
        topic: this.topic
      }
    };
  },
  created() {
	this.mqtt = new MQTT(this.broker, this.options);
	setInterval(() => {
      this.isLongNoReceived = this.longNoReceive();
    }, 5000);
  },
  computed: {
    ...mapGetters(["Message"]),
    
  },
  methods: {
    getRandomClientId() {
      let string = "";
      for (let i = 0; i < 25; i++) {
        let char = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        string += char;
      }
      return string;
	},
	longNoReceive() {
		console.log(Date.now() - Date.parse(this.Message(this.topic).Time) - 3600000 - 60000);
		if((Date.now() - Date.parse(this.Message(this.topic).Time) - 3600000 * 3) > 0)
			return true;
		else
			return false;
    }
  }
};
</script>

<style lang="scss">
.notFound {
  background-color: #313131;
  color: #ee8484;
}

.found {
  background-color: #313131;
  color: #8ce265;
  font-weight: bold;
}

.largeText {
  font-size: xx-large;
}

.notReceiving {
  color: orangered !important;
}
</style>