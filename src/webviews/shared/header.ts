import * as vscode from 'vscode';

export default function (webview: vscode.Webview, extensionUri: vscode.Uri, nonce: string) {

	// stylesheets
	const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'reset.css'));
	const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'vscode.css'));
	const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'styles.css'));

	return `
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
	`;

}