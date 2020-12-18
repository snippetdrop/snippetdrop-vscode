import * as API from '../api';
import { LocalDB } from '../../db';
import { decrypt } from '../encryption';
import { LocalStoreSnippet } from '../../interfaces';

export async function fetchAndSyncSnippets(): Promise<LocalStoreSnippet[]> {
	// fetch any new snippets from SD API
	const newSnippets = await API.fetchSnippets();
	// return out if no new updates
	if (!newSnippets || !newSnippets.length) return [];
	// get existing, local snippets
	const snippets: LocalStoreSnippet[] = LocalDB.getSnippets();
	// get device private key
	const privateKey = LocalDB.getEncryptionPrivateKey();
	// decrypt and append each new snippet to local snippets array
	newSnippets.forEach((s: any) => {
		try {
			snippets.unshift({
				from: s.sender.username,
				snippet: decrypt(privateKey, s.payload),
				timestamp: s.createdAt
			});
		} catch (e) {
			// catch so one snippet failure doesn't fail all
			console.error(e);
		}
	});
	// save merged array of snippets locally
	await LocalDB.setSnippets(snippets);
	// return merged array
	return snippets;
}