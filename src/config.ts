export const DEV: boolean = process.env.NODE_ENV === 'dev';
export const API_DOMAIN: string = DEV ? 'http://localhost:3000' : 'https://snippetdrop.com';
export const LOCAL_AUTH_LISTENER_PORT = 54321;
export const KEY_SIZE = 2048;
export const PUBLIC_KEY_FORMAT = 'openssh-public-pem';
export const PRIVATE_KEY_FORMAT = 'openssh-private-pem';
export const DB_KEYS_PREFIX = DEV ? 'dev.' : '';
export const DB_KEYS = {
	accessKey: DB_KEYS_PREFIX + 'snippetdrop.access_key',
	encryptionKeys: DB_KEYS_PREFIX + 'snippetdrop.encryption_keys',
	encryptionPubKeyHash: DB_KEYS_PREFIX + 'snippetdrop.encryption_pub_key_hash',
	recentContacts: DB_KEYS_PREFIX + 'snippetdrop.recent_contacts',
	snippets: DB_KEYS_PREFIX + 'snippetdrop.snippets'
};