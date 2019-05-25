<template>
  <ion-card class="forecast" v-if="forecast != null">
    <div class="text">{{forecast}}</div>
  </ion-card>
</template>

<script>
export default {
  name: "forecast",
  data() {
    return {
      latitude: null,
      longitude: null,
      forecast: null
    };
  },
  methods: {
    success(pos) {
      var crd = pos.coords;
      this.latitude = crd.latitude;
      this.longitude = crd.longitude;
      console.log(crd.latitude + "     " + crd.longitude);
    },
    getForecast() {
      return new Promise(resolve => {
        fetch(
          "https://api.apixu.com/v1/current.json?key=880e39005a8041e8a18180832192505&q=" + this.latitude + "," + this.longitude).then(response => {
              console.log(response.json());
          resolve(response);
        });
      });
    }
  },
  created() {
    navigator.geolocation.getCurrentPosition(this.success);
    setInterval(() => {
      this.getForecast().then(response => {
          console.log(response);
        this.forecast = response;
      });
    }, 3000);
  }
};
</script>

<style lang="scss">
.forecast {
  background-color: #2a2a2a;
}

.text {
  color: white;
  font-size: 500%;
}
</style>