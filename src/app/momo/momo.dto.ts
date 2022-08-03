import { ERROR_INVALID_INPUT } from '../../config/error';
import Joi from 'joi';
import { MOMO_PARTNER_CODE } from '../../config/key';
import { MSG_PARAM_INVALID } from '../../config/lang';
import { Request } from 'express';
import { Types } from 'mongoose';
import { ValidateError } from '../../utils/HttpError';

class MomoDTO {
	async requirePayment(req: Request) {
		const schema = Joi.object({
			orderId: Joi.string().required(),
			storeId: Joi.string(),
			tax: Joi.number(),
			saleAmmmount: Joi.number().default(1),
			signature1st: Joi.string().required(),
			saleAmmountPaid: Joi.number().default(1),
			price: Joi.number().required(),
			orderInfo: Joi.string().required(),
			extraData: Joi.string().allow(null, '').default(''),
			userInfo: Joi.string(),
			redirectUrl: Joi.string().allow(null, ''),
			ipnUrl: Joi.string().allow(null, ''),
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

	async redirecMomoPage(req: Request) {
		const schema = Joi.object({
			partnerCode: Joi.string()
				.required()
				.valid(MOMO_PARTNER_CODE)
				.messages({
					'any.only': `"partnerCode" ${MSG_PARAM_INVALID}`,
				}),
			orderId: Joi.string()
				.required()
				.custom((v, helper) => {
					if (!Types.ObjectId.isValid(v)) {
						return helper.error('orderId.invalid');
					}
					return new Types.ObjectId(v);
				})
				.messages({
					'orderId.invalid': `"orderId" ${MSG_PARAM_INVALID}`,
				}),
			requestId: Joi.string().required(),
			amount: Joi.number()
				.required()
				.custom((v, helper) => Number(v)),
			orderInfo: Joi.string().required(),
			orderType: Joi.string()
				.required()
				.valid('momo_wallet')
				.messages({
					'any.only': `"orderType" ${MSG_PARAM_INVALID}`,
				}),
			transId: Joi.number()
				.required()
				.custom((v, helper) => Number(v)),
			resultCode: Joi.number()
				.required()
				.valid(
					0,
					9000,
					8000,
					7000,
					1000,
					11,
					12,
					13,
					20,
					22,
					40,
					41,
					42,
					43,
					1001,
					1002,
					1003,
					1004,
					1005,
					1006,
					1007,
					1026,
					1080,
					1081,
					2001,
					2007,
					3001,
					3002,
					3004,
					4001,
					4010,
					4011,
					4100,
					4015,
					10,
					9
				)
				.messages({
					'any.only': `"resultCode" ${MSG_PARAM_INVALID}`,
				}),
			message: Joi.string().required(),
			payType: Joi.string()
				.allow('', null)
				.valid('webApp', 'app', 'qr', 'miniapp', '')
				.messages({
					'any.only': `"payType" ${MSG_PARAM_INVALID}`,
				}),
			responseTime: Joi.number()
				.required()
				.custom((v, helper) => {
					if (new Date(v) > new Date()) {
						return helper.error('string.pattern.base');
					}
					return v;
				})
				.messages({
					'string.pattern.base': `"responseTime" ${MSG_PARAM_INVALID}`,
				}),
			extraData: Joi.string().required(),
			signature: Joi.string().required(),
		});
		try {
			const query = await schema.validateAsync(req.query, {
				abortEarly: false,
			});
			return query;
		} catch (error) {
			throw new ValidateError({
				errorCode: ERROR_INVALID_INPUT,
				message: error.message,
				status: 422,
			});
		}
	}
}
export default new MomoDTO();
