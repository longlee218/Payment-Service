import { NextFunction, Request, Response } from 'express';

const ActionCreator = (Controller: new () => any, method: string) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const instance = new Controller();
		const action = instance[method];
		if (!action || typeof action !== 'function') {
			const error = new Error('Not found method: ' + method);
			return next(error);
		}
		if (action[Symbol.toStringTag] === 'AsyncFunction') {
			action(req, res, next).catch((error: Error) => {
				next(error);
			});
		} else {
			try {
				action(req, res, next);
			} catch (error) {
				next(error);
			}
		}
	};
};

export default ActionCreator;
