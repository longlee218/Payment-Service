import { ERROR_INVALID_INPUT } from '../../config/error';
import Joi from 'joi';
import { Request } from 'express';
import { ValidateError } from '../../utils/HttpError';

class ClientDTO {
	public async create(req: Request) {
		const schema = Joi.object({
			appName: Joi.string().required(),
			ipnUrl: Joi.string().required().strict(),
			redirectUrl: Joi.string().required().strict(),
		});
		try {
			return await schema.validateAsync(req.body, { abortEarly: false });
		} catch (error) {
			throw new ValidateError({
				errorCode: ERROR_INVALID_INPUT,
				message: error.message,
				status: 422,
			});
		}
	}
}
export default new ClientDTO();
