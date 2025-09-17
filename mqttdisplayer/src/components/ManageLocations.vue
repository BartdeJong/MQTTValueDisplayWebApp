<template>
    <div class="manage-locations" :style="{ backgroundImage: `url(${backgroundImageUrl})` }">
        <div class="form-container">
            <h4>Voeg nieuwe locatie toe</h4>
            <form @submit.prevent="addLocation" class="deviceselect">
                <div class="radio-toolbar" v-for="option in possibleLocations">
                    <input type="radio" v-bind:id="option.text" v-bind:value="option.text" v-model="selected">
                    <label class="radio-input" v-bind:for="option.text">{{ option.text }}</label>
                    <br>
                </div>
                <label for="newLocationName">Nieuwe locatie naam (optioneel)</label>
                <input
                    type="text"
                    id="newLocationName"
                    v-model="newLocationName"
                />
                <button class="styled-button" type="submit">Voeg locatie toe</button>
            </form>
        </div>

    
        <!-- List of existing locations with the option to remove -->
        <div v-if="locations.length > 0" class="table-container">
            <h4>Bestaande locaties</h4>
            <table class="styled-table">
                <thead>
                    <tr>
                        <th>Locatie</th>
                        <th>Apparaat ID</th>
                        <th>Actie</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(location, index) in locations" :key="index">
                        <td class="largeText">{{ location.name }}</td>
                        <td class="largeText">{{ location.deviceId }}</td>
                        <td class="centered">
                            <button class="styled-button" @click="removeLocation(index)">Wis</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div v-else>
            <p>Nog geen locaties toegevoegd.</p>
        </div>
        <button class="styled-button" @click="goToHome">Opslaan en terug</button>
    </div>
</template>
  
<script>
import router from "@/router";

export default {
    name: "ManageLocations",
    props: {
      locations: {
        type: Array,
        default() { 
			return [
				{ name: "Woonkamer", deviceId: "Woonkamer" },
				{ name: "Kantoor Bart", deviceId: "Kantoor Bart" },
				{ name: "Kantoor Sjoukje", deviceId: "Kantoor Sjoukje" },
				{ name: "Buiten", deviceId: "Buiten" },
				{ name: "Slaapkamer", deviceId: "Slaapkamer" },
				{ name: "Printer", deviceId: "Printer" },
			]
		},
      },
    },
    data() {
        return {
            newLocationName: "",
            selectedDeviceId: null,
            possibleLocations: [],
            selected: "",
            backgroundImageUrl: localStorage.getItem('userBackgroundImage') || 'https://images.pexels.com/photos/1172064/pexels-photo-1172064.jpeg',
        };
    },
    created() {
        const locationsData = this.getCookie("locationsData");

		if (locationsData !== null) {
			this.locations = JSON.parse(locationsData);
		}

        this.getLocations()
	},
    methods: {
        addLocation() {
            // Check if the new location name and deviceId are not empty
            if (this.selected.trim() !== "") {
                // Emit a custom event to notify the parent component (Home.vue) to add the new location
                if(this.newLocationName == ""){
                    this.newLocationName = this.selected
                }
                this.locations.push({
                    name: this.newLocationName,
                    deviceId: this.selected,
                });
                // Reset the input fields
                this.newLocationName = "";
                this.selected = "None";

                this.getLocations()
            }
        },
        removeLocation(index) {
            this.locations.splice(index, 1);
        },
        setCookie(name, value, daysToExpire) {
            const date = new Date();
            date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
            const expires = "expires=" + date.toUTCString();
            document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
        },
        goToHome() {
            const date = new Date();
            date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
            const expires = "expires=" + date.toUTCString();
            document.cookie = "locationsData" + "=" + encodeURIComponent(JSON.stringify(this.locations)) + ";" + expires + ";path=/";

            router.push({
                name: "home"
            });
        },
        getCookie(name) {
			const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
			return cookieValue ? decodeURIComponent(cookieValue.pop()) : null;
		},
        getLocations() {
			const requestOptions = {
				method: "POST",
				headers: { "Content-Type": "application/json" }
			};

			return fetch('https://c4c6uk1i70.execute-api.eu-central-1.amazonaws.com/prod/read-locations-cdk', requestOptions
			).then(response => response.text()).then(response => {
                var locations = response.split(",");
                this.possibleLocations = [];
                locations.forEach((location) => this.possiblyAddLocation(location))
            });
		},
        possiblyAddLocation(newLocation){
            var inLocations = false;
            this.locations.forEach((location) => {
                if(location.deviceId == newLocation){
                    inLocations = true;
                }
            });
            if(!inLocations){
                this.possibleLocations.push({text: newLocation});
            }
        },
        renderSelect() {
            M.FormSelect.init(document.querySelectorAll('select'));
        },
    },
};
</script>

<style lang="scss">
.form-container {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 20px;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  font-family: 'Segoe UI', sans-serif;
  color: #1e1e1e;
}

.manage-locations {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  transition: background-image 0.3s ease;
}

h4 {
  font-size: 1.6em;           /* larger text */
  font-weight: 700;           /* bolder weight */
  color: #1e1e1e;             /* darker for contrast */
  margin-bottom: 12px;
  letter-spacing: 0.5px;      /* subtle spacing for clarity */
}

label {
  font-weight: 500;
  font-size: 1.05em;
  color: #2a2a2a;
  display: block;
  margin-top: 0px;
}

label[for="newLocationName"] {
  font-size: 1.15em;     /* slightly larger */
  font-weight: 600;      /* bolder than default */
  color: #2a2a2a;         /* consistent with theme */
  margin-top: 8px;
  margin-bottom: 4px;
  letter-spacing: 0.3px; /* subtle clarity boost */
}

input[type="text"] {
  width: 100%;
  padding: 10px 14px;
  margin-top: 4px;
  margin-bottom: 6px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-size: 1.05em;
  font-weight: 500;
  color: #1e1e1e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  text-align: center; /* centers the text horizontally */
}

input[type="text"]:focus {
  outline: none;
  border-color: #00c9a7;
  box-shadow: 0 0 8px rgba(0, 201, 167, 0.4);
}

.styled-button {
  background: rgba(0, 152, 121, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #ffffff;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  padding: 10px 14px;         /* reduced padding */
  font-size: 1em;             /* slightly smaller font */
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: background 0.3s ease;
  max-width: 240px;
  width: auto;                /* allow button to size to content */
  margin: 6px auto;
  display: block;
  white-space: nowrap;       /* prevent wrapping */
}


.styled-button:hover {
  background: rgba(0, 152, 121, 0.5);
}

.table-container {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden; /* prevent horizontal scroll */
  padding: 0px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.styled-table {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  border-collapse: collapse;
  table-layout: fixed; /* ensures columns don’t overflow */
}

/* Header */
.styled-table thead tr {
  background: rgba(0, 152, 121, 0.35);
  color: #ffffff;
  font-weight: 600;
  text-align: left;
}

/* Cells */
.styled-table th,
.styled-table td {
  padding: 6px 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

/* Rows */
.styled-table tbody tr:nth-of-type(even) {
  background: rgba(255, 255, 255, 0.08);
}

.styled-table tbody tr:nth-of-type(odd) {
  background: rgba(255, 255, 255, 0.1);
}

.styled-table tbody tr:last-of-type {
  border-bottom: 2px solid rgba(0, 152, 121, 0.4);
}

.styled-table tbody tr.active-row {
  font-weight: bold;
  color: #00c9a7;
}

.largeText {
  font-size: 1.05em;
}

.centered {
  display: block;
  margin: 0 auto;
}

.radio-toolbar {
  display: inline-block;       /* shrink to fit content */
  margin: 0;                   /* remove extra spacing */
  padding: 0;                  /* no padding */
  line-height: normal;         /* reset line height */
  vertical-align: middle;      /* align with surrounding elements */
}

.radio-toolbar input[type="radio"] {
  display: none;
}

.radio-input {
  padding: 6px 10px;
  font-size: 1em;
  font-weight: 600;
  margin: 2px 0;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid #009879;
  color: #1e1e1e;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.radio-toolbar input[type="radio"]:checked + .radio-input {
  color: #EFBF04;
  border-color: #EFBF04;
  background: rgba(255, 255, 255, 0.3);
}
</style>