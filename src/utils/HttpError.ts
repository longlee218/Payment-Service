interface IBaseError {
	message: string;
	isOperational?: boolean;
	status?: number;
	errorCode?: number | string;
}

export class BaseError extends Error {
	public status: number;
	public isOperational: boolean;
	public errorCode: number | string;

	constructor(errOption: IBaseError) {
		super();
		this.name = this.constructor.name;
		this.message = errOption.message;
		this.status = errOption?.status || 400;
		this.isOperational = errOption?.isOperational || true;
		this.errorCode = errOption?.errorCode || 1;
		Error.captureStackTrace(this, this.constructor);
	}
}

export default class HttpError extends BaseError {
	public errors: Array<Error> | Error | string[] | string | undefined;

	constructor(
		errOptions: IBaseError,
		errors?: Array<Error> | Error | string[] | string
	) {
		super(errOptions);
		this.errors = errors;
	}
}

export class ValidateError extends BaseError {
	public errors: Array<Error> | Error | string[] | string | undefined;
	constructor(
		errOptions: IBaseError,
		errors?: Array<Error> | Error | string[] | string
	) {
		super(errOptions);
		this.errors = errors;
	}
}
