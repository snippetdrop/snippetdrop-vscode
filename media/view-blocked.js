//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {

	let SNIPPETS = [];

	const vscode = acquireVsCodeApi();

	vscode.postMessage({ type: 'get-blocked-users' });

	const actions = {
			unblock: (username) => {
					vscode.postMessage({ type: 'unblock-user', value: username });
			},
	};

	function registerButtons(btns, action, dataKey = 'index') {
			for (let btn of btns) {
					btn.addEventListener('click', e => actions[action](e.target.dataset[dataKey]));
			}
	}
	
	function renderBlockedUsers(usernames) {
			if (usernames && usernames.length) {
					let html = '';
					usernames.forEach((username, i) => {
							html += `
							<div class="blocked-sender-container">
							<div class="username">${username}</div>
							<div data-username="${username}" class="unblock">Unblock</div>
							</div>
							`;
					});
					document.querySelector('.blocked-wrapper').innerHTML = html;
					registerButtons(document.querySelectorAll('.unblock'), 'unblock', 'username');
			} else {
					document.querySelector('.blocked-wrapper').innerHTML = '<p>None</p>';
			}
	}

	// Handle messages sent from the extension to the webview
	window.addEventListener('message', event => {
			const message = event.data; // The json data that the extension sent
			switch (message.type) {
					case 'render-blocked-users':
							{
									renderBlockedUsers(message.value);
									break;
							}
			}
	});

}());


