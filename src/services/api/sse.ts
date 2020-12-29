// realtime notifications via server-sent events
import EventSource from 'eventsource';
import { API_DOMAIN } from '../../config';
import { getAccessKey } from './token';
import { LocalDB } from '../../db';

let lastKeepAlive: number = Date.now();

export let es: EventSource;
let eventHandler;

export function closeSSE() {
	if (es) {
		es.close();
		es = undefined;
	}
}

export async function connectSSE() {
	closeSSE();
	// get API id and key
	const { id, token } = await getAccessKey();
	// get pub key hash
	const hash = LocalDB.getEncryptionHash();
	// setup eventsource params
	const opts = {
		headers: {
			'x-sdrop-id': id,
			"Authorization": token
		}
	};
	// create event stream
	es = new EventSource(`${API_DOMAIN}/v1/events/${hash}`, opts);
	// handle event types
	es.addEventListener('open', e => { console.info('SSE Connected'); });
	es.addEventListener('close', e => { console.info('SSE Closed'); });
	es.addEventListener('error', e => { console.error('SSE Error', e); });
	es.addEventListener('message', (e: MessageEvent) => {
		if (!e || !e.data) return;
		// discard any keep alive messages
		if (e.data === 'keep-alive') {
			lastKeepAlive = Date.now();
			return;
		}
		eventHandler(e.data);
	});
}

setInterval(() => {
	// if it's more than 1.5 min since last keep alive,
	// attempt re-connect
	// required if vscode sits idle in background too long
	if ((Date.now() - lastKeepAlive > 90000) && LocalDB.isLoggedIn()) connectSSE();
}, 60000);

export function setEventHandler(cb) {
	eventHandler = cb;
}