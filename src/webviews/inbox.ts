import * as vscode from 'vscode';
import { LocalDB } from '../db';
import { deleteSnippet } from '../services/snippet/delete';
import { fetchAndSyncSnippets } from '../services/snippet/fetch';
import { blockUser } from '../services/user/block';
import { getNonce } from '../utils';
import header from './shared/header';
import footer from './shared/footer';

export class SnippetsInboxProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'snippetDrop.snippetInbox';

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
				case 'block-user':
					{
						await blockUser(data.value);
						vscode.window.showInformationMessage(`${data.value} blocked`);
						vscode.commands.executeCommand('snippetDrop.refreshBlockedView');
						break;
					}
			}
		});

		this.refreshView();

	}

	public async fetchAndSyncSnippetsWrap() {
		const snippets = await fetchAndSyncSnippets();
		if (snippets && snippets.length) this.notifyWebview('render-snippets', snippets);
	}

	private _getHtmlForWebview(webview: vscode.Webview) {

		// nonce to only allow a specific script to be run
		const nonce = getNonce();

		let html = header(webview, this._extensionUri, nonce);

		if (!LocalDB.isLoggedIn()) {
			html += `Login to send and receive snippets`;
		} else {
			html += `
			<div class="section">
				<div class="snippets-wrap">
				</div>
			</div>
			`;
		}

		html += footer(webview, this._extensionUri, nonce, LocalDB.isLoggedIn() ? 'view-snippets.js' : '');

		return html;

	}
}