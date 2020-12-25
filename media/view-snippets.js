//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {

	let SNIPPETS = [];

	const vscode = acquireVsCodeApi();

	// TODO: Cleanup query selectors
	vscode.postMessage({ type: 'load-local-snippets' });
	vscode.postMessage({ type: 'fetch-and-sync-snippets' });

	function escapeHTML(html) {
		return html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	const actions = {
		copy: (index) => {
			vscode.postMessage({ type: 'copy-to-clipboard', value: SNIPPETS[index].snippet });
		},
		block: (index) => {
			vscode.postMessage({ type: 'block-user', value: SNIPPETS[index].from });
		},
		delete: (index) => {
			vscode.postMessage({ type: 'snippet-delete-index', value: index });
		}
	};

	function registerButtons(btns, action, dataKey = 'index') {
		for (let btn of btns) {
			btn.addEventListener('click', e => actions[action](e.target.dataset[dataKey]));
		}
	}

	function getSnippetPreview(snippet = '', maxCharsToParse = 500, maxLines = 3) {
		// for efficiency, only look at maxCharsToParse
		//  then escape HTML carrots
		//  then split by newline
		const subSnippetLines = escapeHTML(snippet.substring(0, maxCharsToParse)).split('\n');
		// get up to max lines and replace spaces and tabs with &nbsp;
		const previewLines = subSnippetLines.slice(0, maxLines).map(part => part.replace(/ /g, '&nbsp;').replace(/\t/g, '&nbsp;&nbsp;'));
		// if snippet had more lines than allowed to display, add a preview line with ...
		if (subSnippetLines.length > maxLines) {
			previewLines.push(`... (${(snippet.match(/\n/g) || []).length + 1 - maxLines} more lines)`);
		}
		// return each line wrapped inside <code> element
		return previewLines.reduce((html, line) => html + `<code>${line}</code>`, '');
	}

	function renderSnippets(snippets) {
		if (snippets && snippets.length) {
			let html = '';
			snippets.forEach((s, i) => {
				html += `
							<div class="snippet-container">
									<div class="sender">${s.from ? s.from : 'Unknown'}</div>
									<div class="timestamp">${s.timestamp ? new Date(s.timestamp).toLocaleString() : ''}</div>
									<div class="code">
											${getSnippetPreview(s.snippet)}
									</div>
									<div data-index="${i}" class="block">Block</div>
									<div data-index="${i}" class="copy">Copy</div>
									<div data-index="${i}" class="delete">Delete</div>
							</div>
							`;
			});
			document.querySelector('.snippets-wrap').innerHTML = html;
			registerButtons(document.querySelectorAll('.copy'), 'copy');
			registerButtons(document.querySelectorAll('.block'), 'block');
			registerButtons(document.querySelectorAll('.delete'), 'delete');
		} else {
			document.querySelector('.snippets-wrap').innerHTML = '<p>Ask a colleague to send you a snippet or send yourself one to bookmark snippets of code.</p>';
		}
	}

	// Handle messages sent from the extension to the webview
	window.addEventListener('message', event => {
		const message = event.data; // The json data that the extension sent
		switch (message.type) {
			case 'render-snippets':
				{
					SNIPPETS = message.value;
					renderSnippets(message.value);
					break;
				}
		}
	});

}());


