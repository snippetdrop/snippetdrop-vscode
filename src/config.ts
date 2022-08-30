export const DEV: boolean = process.env.NODE_ENV === 'dev';
export const LOCAL_AUTH_LISTENER_PORT = 54321;
export const KEY_SIZE = 2048;
export const PUBLIC_KEY_FORMAT = 'openssh-public-pem';
export const PRIVATE_KEY_FORMAT = 'openssh-private-pem';
export const DB_KEYS_PREFIX = DEV ? 'dev.' : '';
export const DB_KEYS = {
	username: DB_KEYS_PREFIX + 'snippetdrop.username',
	userId: DB_KEYS_PREFIX + 'snippetdrop.user_id',
	apiKey: DB_KEYS_PREFIX + 'snippetdrop.api_key',
	accessKey: DB_KEYS_PREFIX + 'snippetdrop.access_key',
	encryptionKeys: DB_KEYS_PREFIX + 'snippetdrop.encryption_keys',
	encryptionPubKeyHash: DB_KEYS_PREFIX + 'snippetdrop.encryption_pub_key_hash',
	recentContacts: DB_KEYS_PREFIX + 'snippetdrop.recent_contacts',
	snippets: DB_KEYS_PREFIX + 'snippetdrop.snippets',
	snippetsSent: DB_KEYS_PREFIX + 'snippetdrop.snippets_sent'
};

export let API_DOMAIN: string = DEV ? 'http://localhost:3000' : 'https://api.snippetdrop.com';