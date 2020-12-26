import * as vscode from 'vscode';
import { LocalDB } from '../db';
import { getNonce } from '../utils';
import header from './shared/header';
import footer from './shared/footer';
import { sendSnippet } from '../services/snippet/send';

export class SnippetsSentProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'snippetDrop.snippetSent';

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
				case 'load-sent-snippets':
					{
						const snippets = LocalDB.getSnippetsSent();
						this.notifyWebview('render-snippets', snippets);
						break;
					}
				case 'resend-snippet':
					{
						await sendSnippet(data.value);
						vscode.commands.executeCommand('snippetDrop.refreshSentView');
						break;
					}
				case 'copy-to-clipboard':
					{
						vscode.env.clipboard.writeText(data.value);
						vscode.window.showInformationMessage('Snippet copied');
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
			html += `Login to view sent snippets`;
		} else {
			html += `
			<div class="section">
				<div class="snippets-wrap">
				</div>
			</div>
			`;
		}

		html += footer(webview, this._extensionUri, nonce, LocalDB.isLoggedIn() ? 'view-sent-snippets.js' : '');

		return html;

	}
}