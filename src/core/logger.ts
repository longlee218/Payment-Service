import { MODE } from '../config/key';
import winston from 'winston';

/**
 * Configures the winston logger. There are also file and remote transports available
 */
const transformFormat = (info: any) => {
	const args = info[Symbol.for('splat')];
	const strArgs = args
		? args.map((arg: any) => JSON.stringify(arg)).join(' ')
		: '';
	return `[${info.label}] ${[info.timestamp]}  ${info.level}: ${
		info.message
	}\n${strArgs}`;
};

const options = {
	develop: {
		transports: [
			new winston.transports.Http({
				level: 'warn',
				format: winston.format.json(),
			}),
			new winston.transports.Console({
				format: winston.format.combine(
					winston.format.splat(),
					winston.format.colorize({
						all: true,
					}),
					winston.format.label({
						label: 'develop',
					}),
					winston.format.timestamp({
						format: 'MMM-DD-YYYY HH:mm:ss',
					}),
					winston.format.printf((info: any) => {
						return transformFormat(info);
					})
				),
			}),
		],
		format: winston.format.combine(
			winston.format.label({
				label: `DEVELOP`,
			}),
			winston.format.timestamp({
				format: 'YYYY-MM-DD HH:mm:ss',
			})
		),
		defaultMeta: 'payment-service',
	},
	product: {
		transports: [
			new winston.transports.Http({
				level: 'warn',
				format: winston.format.json(),
			}),
			new winston.transports.File({
				filename: 'error.log',
				level: 'error',
				format: winston.format.json(),
			}),
			new winston.transports.Console({
				format: winston.format.combine(
					winston.format.colorize({
						all: true,
					}),
					winston.format.label({
						label: 'product',
					}),
					winston.format.timestamp({
						format: 'YYYY-MM-DD HH:mm:ss',
					}),
					winston.format.simple()
				),
			}),
		],
		format: winston.format.combine(
			winston.format.label({
				label: `PRODUCTION`,
			}),
			winston.format.timestamp({
				format: 'MMM-DD-YYYY HH:mm:ss',
			})
		),
		defaultMeta: 'payment-service',
	},
};

let Logger = winston.createLogger();
if (MODE === 'product') {
	Logger = winston.createLogger(options.product);
} else {
	Logger = winston.createLogger(options.develop);
}

export default Logger;
