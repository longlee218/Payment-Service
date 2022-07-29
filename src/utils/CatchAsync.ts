import { NextFunction, Request, Response } from 'express';

const CatchAsync = (fn: Function) => {
	return (req: Request, res: Response, next: NextFunction) => {
		return fn(req, res, next).catch((error: any) => {
			next(error);
		});
	};
};

export default CatchAsync;
