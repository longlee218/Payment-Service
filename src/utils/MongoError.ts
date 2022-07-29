import { MSG_ALREADY_EXISTS_FIELD } from '../config/lang';

function objToString(obj: any): string {
	let str = '';
	for (let p in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, p)) {
			str += p + ': ' + obj[p] + '\n';
		}
	}
	return str;
}

export function mongoErrorE11000(error: any, doc: any, next: any) {
	if (error.name === 'MongoServerError' && error.code === 11000) {
		const errorMongo = new Error();
		errorMongo.name = 'DatabaseError';
		errorMongo.message =
			MSG_ALREADY_EXISTS_FIELD + objToString(error.keyValue);
		next(errorMongo);
	} else {
		next();
	}
}
