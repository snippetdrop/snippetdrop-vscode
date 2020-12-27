import axios from 'axios';
import { API_DOMAIN } from '../../config';
import { AxiosOptions } from '../../interfaces';
import { LocalDB } from '../../db';

function isTokenExpired(accessKey): boolean {
	// if invalid input, assume expired token
	if (!accessKey || !accessKey.createdAt) return true;
	// calculate epoch expiration time (ms)
	const expiresAt = (new Date(accessKey.createdAt)).getTime() + (accessKey.ttl * 1000);
	// get epoch current time (ms)
	const current = Date.now();
	// overlap period; if key expires in <= 1 min,
	//  go ahead and get new one
	const overlapPeriod = 60000;
	return (expiresAt - current) <= overlapPeriod;
}

// TODO: This and APIClient are redundant; consolidate?
async function getNewTempToken(id, token): Promise<any> {
	const params: AxiosOptions = {
		method: 'GET',
		data: null,
		headers: {
			'x-sdrop-id': id,
			"Authorization": token
		}
	};
	// call API
	const res = await axios(`${API_DOMAIN}/api/v1/token`, params);
	// return API JSON response data
	return res.data;
}

// TODO: This and APIClient are redundant; consolidate?
export async function getApiKeyViaOTT(id, ott): Promise<any> {
	const params: AxiosOptions = {
		method: 'GET',
		data: null,
		headers: {
			'x-sdrop-id': id,
			"Authorization": ott
		}
	};
	// call API
	const res = await axios(`${API_DOMAIN}/api/v1/api-key`, params);
	// return API JSON response data
	return res.data;
}

export async function getAccessKey(): Promise<{ id, token }> {
	const userId = LocalDB.getUserId();
	let accessKey = LocalDB.getAccessKey();
	// if access key unavailable or token expired, get new temp access key
	if (!accessKey || !accessKey.token || !accessKey.createdAt || isTokenExpired(accessKey)) {
		// fetch a new one
		accessKey = await getNewTempToken(userId, LocalDB.getApiKey()); 
		// save it
		await LocalDB.setAccessKey(accessKey);
	}
	// return token and id
	return { id: userId, token: accessKey.token };
}