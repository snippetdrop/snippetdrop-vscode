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
        });
    }

    if (document.querySelector('#disconnect-btn')) {
        vscode.postMessage({ type: 'get-username' });
        document.querySelector('#disconnect-btn').addEventListener('click', () => {
            vscode.postMessage({ type: 'delete-access-key', value: true });
        });
    }

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'generating-rsa':
                {
                    if (document.getElementById('generate-key-msg')) {
                        document.getElementById('generate-key-msg').style.display = "block";
                    }
                    break;
                }
            case 'render-username':
                {
                    if (document.getElementById('username') && message.value) {
                        document.getElementById('username').innerHTML = `Logged in as <strong>${message.value}</strong>`;
                        document.getElementById('username').style.display = "block";
                    }
                    break;
                }
        }
    });

}());


