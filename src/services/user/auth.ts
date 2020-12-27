import http from 'http';
import url from 'url';
import { LOCAL_AUTH_LISTENER_PORT } from '../../config';
import { AccountCreds } from '../../interfaces';
import { getApiKeyViaOTT } from '../api/token';

let server: http.Server;

async function listenForAuthRes(): Promise<any> {
	return new Promise((resolve) => {
		server = http.createServer(function (req, res) {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Request-Method', '*');
			res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
			res.setHeader('Access-Control-Allow-Headers', '*');
			res.writeHead(200, { 'Content-Type': 'text/html' });
			const { userId, ott, username } = url.parse(req.url, true).query;
			res.end(`
			<!doctype html>
			<html lang="en" class="h-100">
			<head>
				<meta charset="utf-8">
				<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
				<title>SnippetDrop VSCode Synced</title>
			</head>
			<body>
				<style>
					body {
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
						font-weight: 400;
						text-align: center;
						margin-top: 50px;
					}
				</style>
				<main id="main">
				Success! You can close this tab and go back to VSCode.
				</main>
			</body>
			</html>
			`);
			resolve({ userId: `${userId}`, ott: `${ott}`, username: `${username}` });
		});
		server.listen(LOCAL_AUTH_LISTENER_PORT);
	});
}

export async function initAuthWorkflow(): Promise<AccountCreds> {
	// spin up local server and listen for response
	const { userId, ott, username } = await listenForAuthRes();
	// gracefully shutdown local server
	if (server && server.close) {
		server.close();
		server = undefined;
	}
	// use ott (one time token) to securely get API key
	const { apiKey } = await getApiKeyViaOTT(userId, ott);
	return { userId, apiKey, username };
}