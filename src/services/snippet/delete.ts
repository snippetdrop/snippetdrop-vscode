import { LocalDB } from '../../db';

export async function deleteSnippet(index: number) {
	// get existing, local snippets
	const snippets = LocalDB.getSnippets();
	// remove snippet at index `index`
	snippets.splice(index, 1);
	// save updated array
	await LocalDB.setSnippets(snippets);
	// return updated array
	return snippets;
}