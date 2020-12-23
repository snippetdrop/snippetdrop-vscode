import * as vscode from 'vscode';
import { LocalDB } from '../../db';
import { encrypt } from '../encryption';
import { getUserPublicKeys, sendSnippet as sendSnippetApi } from '../api';

function getEditorSelection() {
	const editor = vscode.window.activeTextEditor;
	return editor?.document.getText(editor.selection) || '';
}

function getRecipientOptions(contacts: string[]): { label: string }[] {
	return contacts.map(c => ({ label: c }));
}

function quickPickWorkflow(contacts: { label: string }[]): Promise<string> {
	return new Promise((resolve) => {
		const picker = vscode.window.createQuickPick();
		picker.placeholder = 'Enter the recipient\'s GitHub username...';
		picker.items = contacts;
		picker.onDidHide(() => {
			const str = picker.selectedItems && picker.selectedItems.length ? picker.selectedItems[0].label : '';
			resolve(str.toLowerCase()); // SnippetDrop server uses full lowercase usernames
		});
		picker.onDidChangeValue(str => {
			picker.items = str.trim() ? [...contacts, { label: str }] : contacts;
		});
		picker.onDidAccept(() => {
			picker.dispose();
		});
		picker.show();
	});	
}

export async function sendSnippet(snippet?: string) {
	try {
		if (!snippet) {
			// get editor selected text
			snippet = getEditorSelection();
		}
		if (!snippet) return vscode.window.showErrorMessage('Please select some text to create a snippet');
		// get recent contacts from local DB
		let contacts: string[] = LocalDB.getRecentContacts();
		// generate list of recipients (default new user plus recent contacts from local db)
		const recipientOptions: { label: string }[] = getRecipientOptions(contacts);
		// use quick pick and input box to get user's desired recipient
		const recipient: string = await quickPickWorkflow(recipientOptions);
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