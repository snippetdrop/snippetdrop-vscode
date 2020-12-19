import { LocalDB } from '../../db';

export function getIdAndKey(): { id, key } {
	// check if accessToken in LocalDB
	const accessToken: string = LocalDB.getAccessToken();
	if (!accessToken) throw new Error('Invalid access token');
	// check if accessToken is valid with id-key
	const [id, key] = accessToken.split('-');
	if (!id || !key) throw new Error('Invalid access token');
	return { id, key };
}