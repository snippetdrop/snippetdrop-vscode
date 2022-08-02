import axios from 'axios'

export async function getAPIDomain() {
	const res = await axios('https://snippetdrop.com/api.json');
	return res.data?.url
}