export interface LocalStoreSnippet {
	from?: string,
	to?: string,
	snippet: string,
	timestamp: string
}

export interface AccountCreds {
	userId: string,
	apiKey: string,
	username: string
}

export interface KeyPair {
	publicKey: string,
	privateKey: string
}

export interface AxiosOptions {
	method: 'GET' | 'POST' | 'DELETE',
	data: any,
	headers: {
		'x-sdrop-id': string,
		'Authorization': string
	}
}