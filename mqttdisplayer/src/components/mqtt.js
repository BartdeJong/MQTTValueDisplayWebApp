import mqtt from 'mqtt';
import store from '../store';

export default class MQTT {

	constructor(broker, options, topic, json){
		this._json = json;
		this._topic = topic;
		this._client = mqtt.connect(broker, options);
		this.connect();
		this.listen();
	}

	connect(){
		this._client.on("connect", () => {
			this._client.subscribe(this._topic);
		});
	}

	listen(){
		this._client.on("message", (topic, message) => {
			let newMessage = {};
			newMessage.payload = message.toString();
			newMessage.topic = topic;
			
			let storeMessage = this.findMessage();

			if (storeMessage)
				this.deleteMessage(storeMessage)

			this.addMessage(newMessage)
		}); 
	}

	findMessage(){
		let message = store.state.messages.find(message => message.topic == this._topic);
		return message;
	}

	addMessage(message){
		store.state.messages.push(message);
	}

	deleteMessage(message){
		let messageIndex = store.state.messages.indexOf(message);
		store.state.messages.splice(messageIndex, 1);
	}
}