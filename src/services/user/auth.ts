import http from 'http';
import url from 'url';
import { LOCAL_AUTH_LISTENER_PORT } from '../../config';
import { AccountCreds } from '../../interfaces';

let server: http.Server;

async function listenForAuthRes(): Promise<AccountCreds> {
	return new Promise((resolve) => {
		server = http.createServer(function (req, res) {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Request-Method', '*');
			res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
			res.setHeader('Access-Control-Allow-Headers', '*');
			res.writeHead(200, { 'Content-Type': 'text/html' });
			const { userId, apiKey } = url.parse(req.url, true).query;
			res.end('Success');
			resolve({ userId: `${userId}`, apiKey: `${apiKey}` });
		});
		server.listen(LOCAL_AUTH_LISTENER_PORT);
	});
}

export async function initAuthWorkflow(): Promise<AccountCreds> {
	// spin up local server and listen for response
	const { userId, apiKey } = await listenForAuthRes();
	// gracefully shutdown local server
	if (server && server.close) {
		server.close();
		server = undefined;
	}
	return { userId, apiKey };
}