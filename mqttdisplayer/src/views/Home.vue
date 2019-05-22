<template>
  <div class="home">
    <h1>{{temperature}}</h1>
  </div>
</template>

<script>
var mqtt = require("mqtt");

var options = {
  clientId: "234592u234y5782ehr9",
  username: "gfvpvdvd",
  password: "UsI25cETE6yQ"
};
var client = mqtt.connect("wss://m24.cloudmqtt.com:36910", options);

client.on("connect", function() {
  client.subscribe("tele/CloudMQTT/SENSOR", function(err) {
    // if (!err) {
    //   client.publish("presence", "Hello mqtt");
    // }
  });
});

client.on("message", function(topic, message) {
  // message is Buffer
  console.log(message.toString());
  this.tempFromMessage(message.toString());
  //   client.end()
});

export default {
  name: "home",
  data() {
    return {
      client: mqtt.Client,
      temperature: "-20";
    };
  },
  components: {},
  methods: {
    tempFromMessage(message) {
      this.temperature = message;
    }
  },
  mounted() {
    var mqtt = require("mqtt");

    var options = {
      clientId: "234592u234y5782ehr9",
      username: "gfvpvdvd",
      password: "UsI25cETE6yQ"
    };

    client = mqtt.connect("wss://m24.cloudmqtt.com:36910", options);

    client.on("connect", function() {
      client.subscribe("tele/CloudMQTT/SENSOR", function(err) {
        // if (!err) {
        //   client.publish("presence", "Hello mqtt");
        // }
      });
    });

    client.on("message", function(topic, message) {
      // message is Buffer
      console.log(message.toString());
      this.temperature = message;
      //   client.end()
    });
  }
};
</script>
