import { ERROR_HEADER, ERROR_INVALID_TOKEN } from '../config/error';
import { MSG_HEADER_REQUIRED, MSG_INVALID_TOKEN } from '../config/lang';
import { NextFunction, Request, Response } from 'express';

import CatchAsync from '../utils/CatchAsync';
import { HEADER_X_API_KEY } from '../config/key';
import HttpError from '../utils/HttpError';
import clientService from '../app/client/client.service';

const errorCreator = (
	errorCode: number,
	message: string,
	status: number,
	meta: any = {}
) => ({
	responseTime: new Date().getTime(),
	isSuccess: false,
	message: message,
	errors: {
		name: 'HttpError',
		errorCode: errorCode,
		message: message,
		status: status,
		...meta,
	},
});

export const authClientMiddleware = CatchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const token = req.headers[HEADER_X_API_KEY];
		if (!token) {
			throw new HttpError({
				message: MSG_HEADER_REQUIRED + HEADER_X_API_KEY,
				errorCode: ERROR_HEADER,
				isOperational: true,
				status: 401,
			});
		}
		const client = await clientService.getByToken(token as string);
		if (!client) {
			throw new HttpError({
				message: MSG_INVALID_TOKEN,
				errorCode: ERROR_INVALID_TOKEN,
				isOperational: true,
				status: 400,
			});
		}
		req.clientAKB = client;
		next();
	}
);
