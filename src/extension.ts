import * as vscode from 'vscode';
import { LocalDB } from './db';
import { API_DOMAIN } from './config';
import { deleteSnippet } from './services/snippet/delete';
import { getBlockedUsers, blockUser, unblockUser } from './services/user/block';
import { sendSnippet } from './services/snippet/send';
import { fetchAndSyncSnippets } from './services/snippet/fetch';
import setupEncryption from './services/encryption/setup';
import cleanupDevice from './services/device/cleanup';

export function activate(context: vscode.ExtensionContext) {

	// persist the LocalDB in VSCode's global store
	LocalDB.state = context.globalState;

	const provider = new SnippetsViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(SnippetsViewProvider.viewType, provider));

	context.subscriptions.push(
		vscode.commands.registerCommand('snippetDrop.sendSnippet', async () => {
			if (LocalDB.isLoggedIn()) await sendSnippet();
			else vscode.window.showErrorMessage('You must be signed into SnippetDrop to send snippets');
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('snippetDrop.fetchSnippets', async () => {
			await provider.fetchAndSyncSnippetsWrap();
		}));

}

class SnippetsViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'snippetDrop.snippetView';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	private notifyWebview(type: string, value: any) {
		if (this._view) this._view.webview.postMessage({ type, value });
	}

	async resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				this._extensionUri
			]
		};

		const generateView = () => {
			webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
		};

		webviewView.webview.onDidReceiveMessage(async (data) => {
			switch (data.type) {
				case 'trigger-login':
					{
						const uri: vscode.Uri = vscode.Uri.parse(`${API_DOMAIN}/login/${data.value}`);
						vscode.commands.executeCommand("vscode.open", uri);
						break;
					}
				case 'set-access-key':
					{
						await setupEncryption(data.value);
						generateView();
						break;
					}
				case 'delete-access-key':
					{
						await cleanupDevice();
						generateView();
						break;
					}
				case 'fetch-and-sync-snippets':
					{
						await this.fetchAndSyncSnippetsWrap();
						break;
					}
				case 'load-local-snippets':
					{
						const snippets = LocalDB.getSnippets();
						this.notifyWebview('render-snippets', snippets);
						break;
					}
				case 'copy-to-clipboard':
					{
						vscode.env.clipboard.writeText(data.value);
						vscode.window.showInformationMessage('Snippet copied');
						break;
					}
				case 'snippet-delete-index':
					{
						const snippets = await deleteSnippet(parseInt(data.value, 10));
						this.notifyWebview('render-snippets', snippets);
						break;
					}
				case 'get-blocked-users':
					{
						const users = await getBlockedUsers();
						this.notifyWebview('render-blocked-users', users);
						break;
					}
				case 'block-user':
					{
						await blockUser(data.value);
						const users = await getBlockedUsers();
						this.notifyWebview('render-blocked-users', users);
						break;
					}
				case 'unblock-user':
					{
						await unblockUser(data.value);
						const users = await getBlockedUsers();
						this.notifyWebview('render-blocked-users', users);
						break;
					}
			}
		});

		generateView();

	}

	public async fetchAndSyncSnippetsWrap() {
		const snippets = await fetchAndSyncSnippets();
		if (snippets && snippets.length) this.notifyWebview('render-snippets', snippets);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {

		// js scripts
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// stylesheets
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// nonce to only allow a specific script to be run
		const nonce = getNonce();

		return !LocalDB.isLoggedIn() ? `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<!--
						Use a content security policy to only allow loading images from https or from our extension directory,
						and only allow scripts that have a specific nonce.
					-->
			<meta http-equiv="Content-Security-Policy"
				content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<link href="${styleResetUri}" rel="stylesheet">
			<link href="${styleVSCodeUri}" rel="stylesheet">
			<link href="${styleMainUri}" rel="stylesheet">
			<title>SnippetDrop </title>
		</head>
		<body>
			<div class="section section-welcome">
				<h1>Welcome to SnippetDrop</h1>
				<p>Start sharing snippets of code securely with your peers.</p>
				<button class="settings-btn" id="login-btn">Login with GitHub</button>
				<div id="access-token-form">
					<input type="text" id="access-token" name="access-key" placeholder="Insert Access Key Here">
					<button class="access-token-btn" id="access-token-btn">Save Key Token</button>
				</div>
				<p id="generate-key-msg">Generating device RSA key pair...</p>
				<p class="footer"><a href="https://snippetdrop.com/help">Help</a> | <a
						href="https://snippetdrop.com/terms">Terms</a> | <a href="https://snippetdrop.com/privacy">Privacy</a></p>
			</div>
			<script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>
		` : `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<!--
							Use a content security policy to only allow loading images from https or from our extension directory,
							and only allow scripts that have a specific nonce.
						-->
			<meta http-equiv="Content-Security-Policy"
				content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<link href="${styleResetUri}" rel="stylesheet">
			<link href="${styleVSCodeUri}" rel="stylesheet">
			<link href="${styleMainUri}" rel="stylesheet">
			<title>SnippetDrop</title>
		</head>
		<body>
			<div class="section">
				<h1>Snippets Received</h1>
				<div class="snippets-wrap">
				</div>
			</div>
		
			<div class="section">
				<h1>Blocked Senders</h1>
				<div class="blocked-wrapper">
				</div>
			</div>
		
			<div class="section">
				<h1>Settings</h1>
				<button class="settings-btn" id="disconnect-btn">Disconnect Device</button>
				<p class="footer"><a href="https://snippetdrop.com/help">Help</a> | <a
						href="https://snippetdrop.com/terms">Terms</a> | <a href="https://snippetdrop.com/privacy">Privacy</a></p>
			</div>
		
			<script nonce="${nonce}" src="${scriptUri}"></script>
		</body>
		</html>
		`;
	}
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
