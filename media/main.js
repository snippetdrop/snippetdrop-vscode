//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {

    let SNIPPETS = [];

    const vscode = acquireVsCodeApi();

    // TODO: Cleanup query selectors

    if (document.querySelector('#login-btn')) {
        document.querySelector('#login-btn').addEventListener('click', () => {
            vscode.postMessage({ type: 'trigger-login', value: 'github' });
            document.getElementById('login-btn').style.display = "none";
            document.getElementById('access-token-form').style.display = "block";
        });
    }

    if (document.querySelector('#access-token-btn')) {
        document.querySelector('#access-token-btn').addEventListener('click', () => {
            const val = (document.getElementById('access-token').value || '').trim();
            if (!val) return;
            const [id, key] = val.split('-');
            if (!id || !key) return;
            vscode.postMessage({ type: 'set-access-key', value: val });
            document.getElementById('access-token-form').style.display = "none";
            document.getElementById('generate-key-msg').style.display = "block";
        });
    }

    if (document.querySelector('#disconnect-btn')) {
        document.querySelector('#disconnect-btn').addEventListener('click', () => {
            vscode.postMessage({ type: 'delete-access-key', value: true });
        });
        // we know user is logged in, so go ahead and show locally downloaded snippets
        vscode.postMessage({ type: 'load-local-snippets' });
        vscode.postMessage({ type: 'fetch-and-sync-snippets' });
        vscode.postMessage({ type: 'get-blocked-users' });
    }

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
        unblock: (username) => {
            vscode.postMessage({ type: 'unblock-user', value: username });
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
        const subSnippet = (escapeHTML(snippet)).substring(0, maxCharsToParse);
        const lines = subSnippet.split('\n').slice(0, maxLines).map(part => part.replace(/ /g, '&nbsp;').replace(/\t/g, '&nbsp;&nbsp;'));
        return lines.reduce((html, line) => html + `<code>${line}</code>`, '');
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
        console.log(message);
        switch (message.type) {
            case 'render-blocked-users':
                {
                    renderBlockedUsers(message.value);
                    break;
                }
            case 'render-snippets':
                {
                    SNIPPETS = message.value;
                    renderSnippets(message.value);
                    break;
                }
        }
    });

}());


