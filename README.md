# SnippetDrop for Visual Studio Code

SnippetDrop is an end-to-end encrypted, code snippet sharing extension for VSCode. It requires a GitHub account/username.

## Installation

Install through VS Code extensions. Search for `SnippetDrop`.

## Sending Snippets

1. Select one or more lines of code.
2. Right click and select `Send Selection via Snippet Drop`.
3. Select a recent contact to send to or select `New GitHub User` to specifiy a different GitHub username.

## Receiving Snippets

1. Click the SnippetDrop icon in the left sidebar.
2. New snippets are automatically fetched every 10 seconds; you can force fetch using the refresh icon in the top right.
2. Use the on-screen `COPY` buttons to copy a snippet to your clipboard.

## End-to-End Encryption Details

- SnippetDrop uses 2048 bit asymmetric RSA encryption via `node-rsa`
- **Key pairs** are **generated locally** on your device
- **Private keys** stay on your device; **never uploaded**
- Public keys are uploaded to SnippetDrop's server
- **Sending a snippet:** 1) extension downloads recipient's public keys, 2) encrypts snippet, 3) uploads encrypted snippet to SnippetDrop's servers.
- **Receiving snippets:** 1) extension fetches encrypted snippets for your username + public key, 2) decrypts and stores them locally using private key.
- **Encrypted snippets are deleted from servers** once the recipient has downloaded them or 7 days has passed.

## For Extension Development

- Clone repo
- Open repo folder in VSCode
- `npm install`
- `npm run watch` or `npm run compile`
- `F5` to start debugging

## License

GNU Affero General Public License v3.0