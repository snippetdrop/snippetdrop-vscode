import * as vscode from 'vscode';
import { LocalDB } from './db';
import { sendSnippet } from './services/snippet/send';
import { setEventHandler, connectSSE, closeSSE } from './services/api/sse';
import { getFileContents } from './services/device/filesystem';
import { SnippetsInboxProvider } from './webviews/inbox';
import { BlockedSendersProvider } from './webviews/blocked';
import { AccountProvider } from './webviews/account';

export function activate(context: vscode.ExtensionContext) {

	// persist the LocalDB in VSCode's global store
	LocalDB.state = context.globalState;

	const providerInbox = new SnippetsInboxProvider(context.extensionUri);
	const providerBlocked = new BlockedSendersProvider(context.extensionUri);
	const providerAccount = new AccountProvider(context.extensionUri);

	if (LocalDB.isLoggedIn()) connectSSE();

	setEventHandler((msg) => {
		vscode.window.showInformationMessage(msg);
		providerInbox.fetchAndSyncSnippetsWrap();
	});

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(SnippetsInboxProvider.viewType, providerInbox));

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(BlockedSendersProvider.viewType, providerBlocked));

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(AccountProvider.viewType, providerAccount));

	context.subscriptions.push(
		vscode.commands.registerCommand('snippetDrop.sendSnippet', async () => {
			if (LocalDB.isLoggedIn()) await sendSnippet();
			else vscode.window.showErrorMessage('You must be signed into SnippetDrop to send snippets');
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('snippetDrop.sendFile', async (fileInfo) => {
			if (!fileInfo || !fileInfo.fsPath) return;
			if (LocalDB.isLoggedIn()) await sendSnippet(getFileContents(fileInfo.fsPath));
			else vscode.window.showErrorMessage('You must be signed into SnippetDrop to send snippets');
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('snippetDrop.fetchSnippets', async () => {
			await providerInbox.fetchAndSyncSnippetsWrap();
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('snippetDrop.refreshView', async () => {
			providerInbox.refreshView();
			providerBlocked.refreshView();
			providerAccount.refreshView();
			if (LocalDB.isLoggedIn()) connectSSE();
			else closeSSE();
		}));

		context.subscriptions.push(
		vscode.commands.registerCommand('snippetDrop.refreshBlockedView', async () => {
			providerBlocked.refreshView();
		}));

}