import { LocalDB } from '../../db';
import { generateKeyPair } from './index';
import { uploadPublicKey } from '../api';

export default async function setupEncryption() {
	const { publicKey, privateKey } = generateKeyPair();
	const hash = await uploadPublicKey(publicKey);
	await LocalDB.setEncryptionHash(hash);
	await LocalDB.setEncryptionKeys(publicKey, privateKey);
}