// https://www.npmjs.com/package/node-rsa
// - using the default 2048 bit

import NodeRSA from 'node-rsa';
import { KeyPair } from '../../interfaces';
import { KEY_SIZE, PRIVATE_KEY_FORMAT, PUBLIC_KEY_FORMAT } from '../../config';

export function generateKeyPair(): KeyPair {
	const key = new NodeRSA().generateKeyPair(KEY_SIZE);
	const publicKey = key.exportKey(PUBLIC_KEY_FORMAT);
	const privateKey = key.exportKey(PRIVATE_KEY_FORMAT);
	return { publicKey, privateKey };
}

export function encrypt(keyStr: string, payload: string): string {
	const key = new NodeRSA();
	key.importKey(keyStr, PUBLIC_KEY_FORMAT);
	const encrypted = key.encrypt(payload, 'base64');
	return encrypted;
}

export function decrypt(keyStr: string, payload: string): string {
	const key = new NodeRSA();
	key.importKey(keyStr, PRIVATE_KEY_FORMAT);
	const decrypted = key.decrypt(payload, 'utf8');
	return decrypted;
}
