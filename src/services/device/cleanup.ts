import { LocalDB } from '../../db';
import { deleteDevice } from '../api';

export default async function cleanupDevice() {
	try {
		// continue even if remote device delete fails
		await deleteDevice();
	} catch (e) {
		console.error(e);
	}
	await LocalDB.clear();
}