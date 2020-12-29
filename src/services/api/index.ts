import { hostname } from 'os';
import { LocalDB } from '../../db';
import APIClient from './client';

export async function fetchSnippets(): Promise<[any?]> {
	const publicKeyHash = LocalDB.getEncryptionHash();
	if (!publicKeyHash) return [];
	return APIClient('POST', '/v1/fetch', { publicKeyHash });
}

export async function getBlockedUsers(): Promise<string[]> {
	return APIClient('GET', '/v1/users/blocked', {});
}

export async function blockUser(username: string) {
	return APIClient('POST', '/v1/users/block', { username });
}

export async function unblockUser(username: string) {
	return APIClient('POST', '/v1/users/unblock', { username });
}

export async function sendSnippet(recipient: string, payloadPerKey: []) {
	return APIClient('POST', '/v1/send', { recipient, payloadPerKey });
}

export async function getUserPublicKeys(username: string) {
	return APIClient('GET', `/v1/users/${username}/public-keys`, null);
}

export async function uploadPublicKey(publicKey: string) {
	const host = hostname();
	const res = await APIClient('POST', '/v1/public-keys', { hostname: host, publicKey });
	return res.hash;
}

export async function deleteDevice() {
	return APIClient('DELETE', '/v1/public-keys', { hash : LocalDB.getEncryptionHash() });
}