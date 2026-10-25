import mqtt from 'mqtt';
import { addMessage, setConnection } from '../store.mjs';

export default class MQTT {
	constructor(broker, options, topic, connectionTopic = topic) {
		this._topic = topic;
		this._connectionTopic = connectionTopic;
		this._client = mqtt.connect(broker, options);
		this.connect();
		this.listen();
	}

	connect() {
		this._client.on("connect", () => {
			setConnection({
				topic: this._connectionTopic,
				status: "connecting",
			});
			this._client.subscribe(this._topic, error => {
				setConnection({
					topic: this._connectionTopic,
					status: error ? "error" : "connected",
					error: error ? error.message : null,
				});
			});
		});
		this._client.on("reconnect", () => this.setStatus("connecting"));
		this._client.on("offline", () => this.setStatus("offline"));
		this._client.on("close", () => this.setStatus("disconnected"));
		this._client.on("error", error => this.setStatus("error", error.message));
	}

	listen() {
		this._client.on("message", (topic, message) => {
			addMessage({
				payload: message.toString(),
				topic,
				receivedAt: Date.now(),
			});
		});
	}

	setStatus(status, error = null) {
		setConnection({
			topic: this._connectionTopic,
			status,
			error,
		});
	}

	disconnect() {
		this._client.end(true);
		this.setStatus("disconnected");
	}
}