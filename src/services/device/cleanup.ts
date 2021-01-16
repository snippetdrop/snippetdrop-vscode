import { LocalDB } from '../../db';
import { deleteDevice } from '../api';

export default async function cleanupDevice(callApiCleanup = true) {
	try {
		// continue even if remote device delete fails
		if (callApiCleanup) await deleteDevice();
	} catch (e) {
		console.error(e);
	}
	await LocalDB.clear();
}