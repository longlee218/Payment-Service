import { DB_AUTHSOURCE, DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from './key';

const options = {
	mongoose: {
		connection: DB_HOST,
		authSource: DB_AUTHSOURCE,
		user: DB_USER,
		password: DB_PASSWORD,
		connectTimeoutMS: 1000,
		dbName: DB_NAME,
	},
};

export default options;
