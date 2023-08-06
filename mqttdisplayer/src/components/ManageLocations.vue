<template>
    <div class="manage-locations">
        <h4>Voeg nieuwe locatie toe</h4>
        <form @submit.prevent="addLocation">
            <label for="newLocationName">Nieuwe locatie naam</label>
            <input
                type="text"
                id="newLocationName"
                v-model="newLocationName"
                required
            />
            <label for="newLocationDeviceId">Nieuw apparaat ID</label>
            <input
                type="text"
                id="newLocationDeviceId"
                v-model="newLocationDeviceId"
                required
            />
            <button class="styled-button" type="submit">Voeg locatie toe</button>
        </form>
    
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
                            <button class="styled-button" @click="removeLocation(index)">Verwijder</button>
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
            newLocationDeviceId: "",
        };
    },
    created() {
		const locationsData = this.getCookie("locationsData");

		if (locationsData !== null) {
			this.locations = JSON.parse(locationsData);
		}
	},
    methods: {
        addLocation() {
            // Check if the new location name and deviceId are not empty
            if (this.newLocationName.trim() !== "" && this.newLocationDeviceId.trim() !== "") {
                // Emit a custom event to notify the parent component (Home.vue) to add the new location
                this.locations.push({
                    name: this.newLocationName,
                    deviceId: this.newLocationDeviceId,
                });
                // Reset the input fields
                this.newLocationName = "";
                this.newLocationDeviceId = "";
            }
        },
        removeLocation(index) {
        // Remove the location from the locations array in this component
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
		}
    },
};
</script>

<style>
/* Add your custom styles for the ManageLocations page here */
.manage-locations {
    max-width: 600px;
    margin: 0 auto;
}

.styled-table {
  border-collapse: collapse;
  margin: 1px 0;
  font-size: 1.05em;
  font-family: sans-serif;
  min-width: 250px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  overflow-x: hidden;
}

/* Styling the header */
.styled-table thead tr {
  background-color: #009879;
  color: #ffffff;
  text-align: left;
}

/* Styling the table cells */
.styled-table th,
.styled-table td {
  padding: 12px 15px;
}

/* Styling the table rows */
.styled-table tbody tr {
  border-bottom: 1px solid #dddddd;
}

.styled-table tbody tr:nth-of-type(even) {
  background-color: #ffffff;
}

.styled-table tbody tr:nth-of-type(odd) {
  background-color: #f3f3f3e3;
}

.styled-table tbody tr:last-of-type {
  border-bottom: 2px solid #009879;
}

/* Styling the active row */
.styled-table tbody tr.active-row {
  font-weight: bold;
  color: #009879;
}

.centered {
  display: block;
  margin: 0 auto;
}
</style>  