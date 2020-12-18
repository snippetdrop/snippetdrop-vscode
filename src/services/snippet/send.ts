import * as vscode from 'vscode';
import { LocalDB } from '../../db';
import { encrypt } from '../encryption';
import { getUserPublicKeys, sendSnippet as sendSnippetApi } from '../api';

const DEFAULT_NEW_USER_LABEL = 'New GitHub User';

function getEditorSelection() {
	const editor = vscode.window.activeTextEditor;
	return editor?.document.getText(editor.selection) || '';
}

function getRecipientOptions(contacts: string[]): { label: string }[] {
	const items = [{ label: DEFAULT_NEW_USER_LABEL }];
	for (const contact of contacts) {
		if (contact) items.push({ label: contact });
	}
	return items;
}

async function showRecipientSelectionWorkflow(contacts: { label: string }[]): Promise<string> {
	const recipientOption = await vscode.window.showQuickPick(contacts, { placeHolder: "Select a recipient..." });
	if (!recipientOption) return '';
	let recipient: string;
	if (recipientOption.label === DEFAULT_NEW_USER_LABEL) {
		recipient = (await vscode.window.showInputBox({ placeHolder: "Enter the recipient's GitHub username..." })) || '';
	} else {
		recipient = recipientOption.label;
	}
	return recipient;
}

export async function sendSnippet() {
	try {
		// get editor selected text
		const snippet = getEditorSelection();
		if (!snippet) return vscode.window.showErrorMessage('Please select some text to create a snippet');
		// get recent contacts from local DB
		let contacts: string[] = LocalDB.getRecentContacts();
		// generate list of recipients (default new user plus recent contacts from local db)
		const recipientOptions: { label: string }[] = getRecipientOptions(contacts);
		// use quick pick and input box to get user's desired recipient
		const recipient: string = await showRecipientSelectionWorkflow(recipientOptions);
		if (!recipient) return;
		// fetch recipient's public keys from SD API
		const publicKeysToEncryptWith = await getUserPublicKeys(recipient);
		// if no public keys in response, recipient either doesn't exist or sender blocked them
		if (!publicKeysToEncryptWith || !publicKeysToEncryptWith.length) {
			return vscode.window.showErrorMessage(`GitHub user ${recipient} is either not setup on SnippetDrop or does not exist.`);
		}
		// encrypt snippet per public key
		publicKeysToEncryptWith.map((x: any) => {
			x.payload = encrypt(x.key, snippet);
		});
		// send encrypted snippet via SD API
		await sendSnippetApi(recipient, publicKeysToEncryptWith);
		// notify user of success
		vscode.window.showInformationMessage(`Snippet sent to ${recipient}`);
		// add recipient as most recent contact
		contacts.unshift(recipient);
		// ensure no dupes in contacts
		contacts = [...new Set(contacts)];
		// save contacts
		await LocalDB.setRecentContacts(contacts);
	} catch (e) {
		vscode.window.showErrorMessage(e.toString());
	}
}