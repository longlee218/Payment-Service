import DatabaseOptions from '../config/database';
import Logger from './logger';
import mongoose from 'mongoose';

export const connectMongoDB = () => {
	const mongooseOptions = DatabaseOptions.mongoose;
	mongoose.connection.on('connected', () => {
		Logger.info('mongodb connect success');
	});
	mongoose.connection.on('error', (error) => {
		Logger.error('mongodb connected error', error);
	});
	mongoose.connection.on('disconnected', () => {
		Logger.warn('mongodb disconnected');
	});
	return mongoose.connect(mongooseOptions.connection, {
		autoIndex: true,
		autoCreate: true,
		user: mongooseOptions.user,
		pass: mongooseOptions.password,
		dbName: mongooseOptions.dbName,
		connectTimeoutMS: mongooseOptions.connectTimeoutMS,
		authSource: mongooseOptions.authSource,
	});
};
