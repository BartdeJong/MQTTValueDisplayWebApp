import mqtt from 'mqtt';
import store from '../store';

export default class MQTT {

	constructor(broker, options){
		
		this._topic = options.topic;
		this._client = mqtt.connect(broker, options);
		this.connect();
		this.listen();
		
	}

	connect(){
		this._client.on("connect", () => {
			console.log("Connected to MQTTBroker");
			this._client.subscribe("tele/" + this._topic + "/SENSOR");
		});
	}

	listen(){
		this._client.on("message", (topic, message) => {
			console.log(message.toString());
			let newMessage = JSON.parse(message.toString())
			newMessage["topic"] = this._topic;

			console.log(newMessage);
			
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