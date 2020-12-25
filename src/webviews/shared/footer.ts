import * as vscode from 'vscode';

export default function (webview: vscode.Webview, extensionUri: vscode.Uri, nonce: string, scriptsFilename: string) {

	// js scripts
	const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', scriptsFilename));

	return scriptsFilename ? `
	<script nonce="${nonce}" src="${scriptUri}"></script>
	</body>
	</html>
	` : `
	</body>
	</html>
	`;

}