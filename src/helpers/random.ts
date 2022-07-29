export function makeRandomStr(len: number = 10) {
	let text = '';
	let possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (var i = 0; i < len; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}
