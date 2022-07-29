import { API_V1, MODE } from '../config/key';
import { MSG_SMT_WRONG, TITLE_ERROR } from '../config/lang';
import { NextFunction, Request, Response } from 'express';

import Logger from '../core/logger';
import { errorCreator } from './HttpResponse';

const Errorhandle = (
	error: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	// Error API
	if (req.originalUrl.startsWith(API_V1)) {
		Logger.error(
			'Error API => ' + error.message,
			error.errorCode,
			error.stack
		);
		if (error.isOperational) {
			return res.status(error?.status || 500).json(errorCreator(error));
		}
		return res.status(error?.status || 500).json(errorCreator(error, false));
	}

	Logger.error('Error view => ' + error.message, error.errorCode, error.stack);
	// Error Web client
	if (MODE === 'product') {
		return res.status(error?.status || 500).render('error', {
			title: TITLE_ERROR,
			message: error.isOperational ? error.message : MSG_SMT_WRONG,
		});
	}
	return res.status(error?.status || 500).render('error', {
		title: TITLE_ERROR,
		message: error.isOperational ? error.message : MSG_SMT_WRONG,
		stack: error.stack,
	});
};

export default Errorhandle;
