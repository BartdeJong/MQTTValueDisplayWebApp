import { get, writable } from "svelte/store";

export const messages = writable([]);
export const connections = writable({});

export function addMessage(message) {
	messages.update(current => {
		const index = current.findIndex(existing => existing.topic === message.topic);
		if (index === -1) return [...current, message];
		return current.map((existing, currentIndex) => currentIndex === index ? message : existing);
	});
}

export function setConnection({ topic, status, error = null }) {
	connections.update(current => ({
		...current,
		[topic]: { status, error },
	}));
}

export function getMessage(topic) {
	return get(messages).find(message => message.topic === topic);
}

export function getConnection(topic) {
	return get(connections)[topic] || { status: "connecting", error: null };
}
