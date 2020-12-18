import axios from 'axios';
import * as vscode from 'vscode';
import { API_DOMAIN } from '../../config';
import { AxiosOptions } from '../../interfaces';
import { LocalDB } from '../../db';

export default async function (method: 'GET' | 'POST' | 'DELETE', path: string, data: any) {
	try {
		// check if accessToken in LocalDB
		const accessToken: string = LocalDB.getAccessToken();
		if (!accessToken) throw new Error('Invalid access token');
		// check if accessToken is valid with id-key
		const [id, key] = accessToken.split('-');
		if (!id || !key) throw new Error('Invalid access token');
		// setup params for API call
		const params: AxiosOptions = {
			method,
			data,
			headers: {
				'x-sdrop-id': id,
				"Authorization": key
			}
		};
		// call API
		const res = await axios(`${API_DOMAIN}${path}`, params);
		// return API JSON response data
		return res.data;
	} catch (e) {
		console.error(e);
		vscode.window.showErrorMessage(`SnippetDrop API Error: ${e.toString()}`);
	}
}