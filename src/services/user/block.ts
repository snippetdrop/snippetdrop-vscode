import * as API from '../api';

export async function getBlockedUsers(): Promise<string[]> {
	return API.getBlockedUsers();
}

export async function blockUser(username: string): Promise<any> {
	return API.blockUser(username.toLowerCase());
}

export async function unblockUser(username: string): Promise<any> {
	return API.unblockUser(username.toLowerCase());
}