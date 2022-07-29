import fetch from 'node-fetch';

export async function postData(url: string = '', data: any) {
	await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	});
}
