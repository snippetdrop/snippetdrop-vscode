export interface LocalStoreSnippet {
	from: string,
	snippet: string,
	timestamp: string
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