import { MODE } from '../config/key';
import fetch, { Response } from 'node-fetch';
import https from 'https';

const httpsAgent = new https.Agent({
	rejectUnauthorized: MODE === 'develop' ? false : true,
});

export async function postData(url: string = '', data: any): Promise<Response> {
	const fetchOptions = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'json',
		},
		body: JSON.stringify(data),
		...(url.startsWith('https') ? { agent: httpsAgent } : {}),
	};
	return await fetch(url, fetchOptions);
}
