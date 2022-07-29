import { MODE } from '../config/key';
import { MSG_SERVER_ERROR } from '../config/lang';
import { Response } from 'express';

interface IHttpResponse {
	res: Response;
	statusCode?: number;
	msg?: string;
	data?: any;
	errors?: any;
}

export interface IResponse {
	responseTime?: any;
	isSuccess?: boolean;
	message?: string;
	data?: any;
	errors?: any;
	stacks?: any;
}

export const errorCreator = (
	error: any,
	isOperational: boolean = true
): IResponse => ({
	responseTime: new Date().getTime(),
	isSuccess: false,
	message: isOperational ? error.message : MSG_SERVER_ERROR,
	errors: {
		name: error.name || 'HttpError',
		errorCode: error.errorCode || 1,
		message: error.message || 'error',
	},
	...(MODE === 'product' ? {} : { stacks: error.stack }),
});

export const successCreator = (
	statusCode: number,
	msg: string,
	data: any
): IResponse => ({
	responseTime: new Date().getTime(),
	isSuccess: statusCode >= 200 && statusCode <= 299,
	message: msg,
	data,
});

export default class HttpResponse {
	private res: Response;
	private statusCode: number;
	private msg: string;
	private data: any;

	constructor(iHttp: IHttpResponse) {
		this.res = iHttp.res;
		this.statusCode = iHttp.statusCode ?? 200;
		this.msg = iHttp.msg ?? 'ok';
		this.data = iHttp.data ?? undefined;
		this._response();
	}

	private _response() {
		return this.res
			.status(this.statusCode)
			.json(successCreator(this.statusCode, this.msg, this.data));
	}
}
