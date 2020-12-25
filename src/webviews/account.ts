import * as vscode from 'vscode';
import { LocalDB } from '../db';
import { API_DOMAIN } from '../config';
import setupEncryption from '../services/encryption/setup';
import cleanupDevice from '../services/device/cleanup';
import { initAuthWorkflow } from '../services/user/auth';
import { getNonce } from '../utils';
import header from './shared/header';
import footer from './shared/footer';

export class AccountProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'snippetDrop.accountSettings';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri
	) { }

	public notifyWebview(type: string, value: any) {
		if (this._view) this._view.webview.postMessage({ type, value });
	}

	public refreshView() {
		if (this._view) this._view.webview.html = this._getHtmlForWebview(this._view.webview);
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

		webviewView.webview.onDidReceiveMessage(async (data) => {
			switch (data.type) {
				case 'trigger-login':
					{
						const uri: vscode.Uri = vscode.Uri.parse(`${API_DOMAIN}/login/${data.value}`);
						vscode.commands.executeCommand("vscode.open", uri);
						const { userId, apiKey } = await initAuthWorkflow();
						this.notifyWebview('generating-rsa', null);
						await LocalDB.setUserId(userId);
						await LocalDB.setApiKey(apiKey);
						await setupEncryption();
						vscode.commands.executeCommand('snippetDrop.refreshView');
						break;
					}
				case 'delete-access-key':
					{
						await cleanupDevice();
						vscode.commands.executeCommand('snippetDrop.refreshView');
						break;
					}
			}
		});

		this.refreshView();

	}

	private _getHtmlForWebview(webview: vscode.Webview) {

		// nonce to only allow a specific script to be run
		const nonce = getNonce();

		let html = header(webview, this._extensionUri, nonce);

		if (!LocalDB.isLoggedIn()) {
			html += `
			<div class="section">
				<button class="settings-btn" id="login-btn">Login with GitHub</button>
				<p id="generate-key-msg">Generating device RSA key pair...</p>
				<p class="footer"><a href="https://snippetdrop.com/help">Help</a> | <a
						href="https://snippetdrop.com/terms">Terms</a> | <a href="https://snippetdrop.com/privacy">Privacy</a></p>
			</div>
			`;
		} else {
			html += `
			<div class="section">
				<button class="settings-btn" id="disconnect-btn">Disconnect Device</button>
				<p class="footer"><a href="https://snippetdrop.com/help">Help</a> | <a
						href="https://snippetdrop.com/terms">Terms</a> | <a href="https://snippetdrop.com/privacy">Privacy</a></p>
			</div>
			`;
		}

		html += footer(webview, this._extensionUri, nonce, 'view-account.js');

		return html;

	}
}