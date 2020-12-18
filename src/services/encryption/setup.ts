import { LocalDB } from '../../db';
import { generateKeyPair } from './index';
import { uploadPublicKey } from '../api';

export default async function setupEncryption(accessKey: string) {
	await LocalDB.setAccessKey(accessKey);
	const { publicKey, privateKey } = generateKeyPair();
	const hash = await uploadPublicKey(publicKey);
	await LocalDB.setEncryptionHash(hash);
	await LocalDB.setEncryptionKeys(publicKey, privateKey);
}