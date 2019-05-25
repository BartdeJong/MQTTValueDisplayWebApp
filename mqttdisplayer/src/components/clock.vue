<template>
  <ion-card class="clock">
    <ion-card-title class="text">{{time}}</ion-card-title>
  </ion-card>
</template>

<script>
export default {
  name: "clock",
  data() {
    return {
      time: null
    };
  },
  methods: {},
  created() {
    setInterval(() => {
			var today = new Date();
			let hourFiller = "";
			let minuteFiller = "";
			if(today.getHours() < 10)
				hourFiller = "0";
			if(today.getMinutes() < 10)
				minuteFiller = "0";
      this.time = hourFiller + today.getHours() + ":" + minuteFiller + today.getMinutes();
    }, 10000);
  }
};
</script>

<style lang="scss">
.clock {
  background-color: #2a2a2a;
}

.text {
  color: white;
  font-size: 500%;
}
</style>