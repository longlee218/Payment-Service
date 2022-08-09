import { MODE } from '../config/key';
import fetch from 'node-fetch';
import https from 'https';

const httpsAgent = new https.Agent({
	rejectUnauthorized: MODE === 'develop' ? false : true,
});

export async function postData(url: string = '', data: any) {
	await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'json',
		},
		body: JSON.stringify(data),
		agent: httpsAgent,
	});
}
