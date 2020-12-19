// realtime notifications via server-sent events
import EventSource from 'eventsource';
import { API_DOMAIN } from '../../config';
import { getIdAndKey } from './token';
import { LocalDB } from '../../db';

export let es: EventSource;
let eventHandler;

export function closeSSE() {
	if (es) {
		es.close();
		es = undefined;
	}
}

export function connectSSE() {
	closeSSE();
	// get API id and key
	const { id, key } = getIdAndKey();
	// get pub key hash
	const hash = LocalDB.getEncryptionHash();
	// setup eventsource params
	const opts = {
		headers: {
			'x-sdrop-id': id,
			"Authorization": key
		}
	};
	// create event stream
	es = new EventSource(`${API_DOMAIN}/api/v1/events/${hash}`, opts);
	// handle event types
	es.addEventListener('open', e => { console.info('SSE Connected'); });
	es.addEventListener('close', e => { console.info('SSE Closed'); });
	es.addEventListener('error', e => { console.error('SSE Error', e); });
	es.addEventListener('message', (e: MessageEvent) => {
		if (!e || !e.data) return;
		// discard any keep alive messages
		if (e.data === 'keep-alive') return;
		eventHandler(e.data);
	});
}

export function setEventHandler(cb) {
	eventHandler = cb;
}