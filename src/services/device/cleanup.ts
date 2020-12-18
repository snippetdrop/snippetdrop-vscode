import { LocalDB } from '../../db';
import { deleteDevice } from '../api';

export default async function cleanupDevice() {
	await deleteDevice();
	await LocalDB.clear();
}