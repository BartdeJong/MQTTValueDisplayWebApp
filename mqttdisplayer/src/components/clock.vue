<template>
  <ion-card class="clock">
	  <ion-card-title class="text">
	  {{time}}
	  </ion-card-title>
	</ion-card>
</template>

<script>
export default {
  name: "clock",
  data() {
    return {
		time: null,
	};
  },
  methods: {},
  created() {
	setInterval(() => {
		var today = new Date();
      this.time = today.getHours() + ":" + today.getMinutes();
    }, 10000);
  },
};
</script>

<style lang="scss">
.clock{
	background-color: #2a2a2a;
}

.text{
	color: white;
	font-size: 500%;
}
</style>