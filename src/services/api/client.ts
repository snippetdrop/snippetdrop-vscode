import axios from 'axios';
import * as vscode from 'vscode';
import { API_DOMAIN } from '../../config';
import { AxiosOptions } from '../../interfaces';
import { getAccessKey } from './token';

export default async function (method: 'GET' | 'POST' | 'DELETE', path: string, data: any) {
	try {
		// get API id and key
		const { id, token } = await getAccessKey();
		// setup params for API call
		const params: AxiosOptions = {
			method,
			data,
			headers: {
				'x-sdrop-id': id,
				"Authorization": token
			}
		};
		// call API
		const res = await axios(`${API_DOMAIN}${path}`, params);
		// return API JSON response data
		return res.data;
	} catch (e) {
		// if 401 force fetch a new temp token then show try again error
		vscode.window.showErrorMessage(`SnippetDrop API - ${e.toString()}`);
		throw e;
	}
}