import * as vscode from 'vscode';
import { LocalDB } from '../db';
import { getBlockedUsers, unblockUser } from '../services/user/block';
import { getNonce } from '../utils';
import header from './shared/header';
import footer from './shared/footer';

export class BlockedSendersProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'snippetDrop.blockedSenders';

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
				case 'get-blocked-users':
					{
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

		this.refreshView();

	}

	private _getHtmlForWebview(webview: vscode.Webview) {

		// nonce to only allow a specific script to be run
		const nonce = getNonce();

		let html = header(webview, this._extensionUri, nonce);

		if (!LocalDB.isLoggedIn()) {
			html += `Login to view blocked users`;
		} else {
			html += `
			<div class="section">
				<div class="blocked-wrapper">
				</div>
			</div>
			`;
		}

		html += footer(webview, this._extensionUri, nonce, LocalDB.isLoggedIn() ? 'view-blocked.js' : '');

		return html;

	}
}