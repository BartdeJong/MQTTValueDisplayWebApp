import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		messages: [],
	},
	mutations: {
		addMessage(state, message) {
			state.messages.push(message);
		}
	},
	getters: {
		Message: state => (topic) => {
			return state.messages.find(message => message.topic == topic);
		},
		lastMessageTime: state => {
			if (state.messages.length != 0) {
				let time = state.messages[0].time;
				state.messages.forEach(message => {

				});
				return time;
			}
			else {
				return false;
			}
		}
	}
})
