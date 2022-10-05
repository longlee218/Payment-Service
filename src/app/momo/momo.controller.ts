import { Contract, Sale } from '../../models';
import {
	ERROR_APPLICATION,
	ERROR_DIFF_SIGNATURE,
	ERROR_MOMO,
} from '../../config/error';
import HttpResponse, { successCreator } from '../../utils/HttpResponse';
import {
	MSG_INVALID_SIGNATURE,
	MSG_NOT_FOUND,
	MSG_SALE_ARE_DELETED,
	MSG_SUCCESS,
	MSG_TRADE_WAS_SLOVED,
} from '../../config/lang';
import { NextFunction, Request, Response } from 'express';

import { EnumStatus } from '../../config/enum';
import HttpError from '../../utils/HttpError';
import IBaseController from '../base/base.controller';
import Logger from '../../core/logger';
import { MoMo } from '../../types/momo';
import contractService from '../contract/contract.service';
import momoDto from './momo.dto';
import momoService from './momo.service';
import { postData } from '../../services/requestToServer';
import saleService from '../sale/sale.service';
import url from 'url';

export default class MomoPaymentController implements IBaseController {
	async requirePayment(req: Request, res: Response, next: NextFunction) {
		console.log(req.body);
		const {
			storeId,
			tax,
			price,
			orderId,
			orderInfo,
			extraData,
			userInfo,
			ipnUrl,
			redirectUrl,
			signature1st,
		} = await momoDto.requirePayment(req);

		const saleHas = await Sale.findOne({
			orderId,
			client: req.clientAKB._id,
		});

		if (saleHas) {
			// throw new HttpError({
			// 	message: saleHas.isSuccess
			// 		? MSG_TRADE_WAS_SLOVED
			// 		: MSG_SALE_ARE_SOLVING,
			// 	errorCode: ERROR_APPLICATION,
			// });
			if (saleHas.isSuccess) {
				throw new HttpError({
					message: MSG_TRADE_WAS_SLOVED,
					errorCode: ERROR_APPLICATION,
				});
			}
		}

		const sale = await saleService.initNewSale(req.clientAKB, {
			orderId,
			storeId,
			tax,
			price,
			saleInfo: orderInfo,
			extraData: extraData || '',
			userInfo,
		});

		return momoService.getPaymentTypeFromMomo(
			req.clientAKB,
			sale._id,
			req.fullHost,
			{
				storeId: storeId,
				amount: price,
				orderId: sale._id.toString(),
				orderInfo: orderInfo,
				extraData: extraData,
				ipnUrlClient: ipnUrl || req.clientAKB.ipnUrl,
				redirectUrlClient: redirectUrl || req.clientAKB.redirectUrl,
				signature1st: signature1st,
			},
			(error: any | null, data: any) => {
				if (error) {
					return next(error);
				}
				return new HttpResponse({
					res,
					data: data,
				});
			}
		);
	}

	async ipnSolveMomo(req: Request, res: Response, next: NextFunction) {
		Logger.info('Momo comming by IPN');
		const { body } = req;
		if (!body) {
			const error = new HttpError({
				message: "Not found body in Momo's request.",
				errorCode: ERROR_MOMO,
			});
			Logger.error(error.message, error);
			return res.sendStatus(204);
		}

		const {
			amount,
			requestId,
			resultCode,
			message,
			payType,
			responseTime,
			signature,
			extraData,
			orderInfo,
			orderType,
			transId,
		} = body;
		const contract = await Contract.findOneWithDeleted({ requestId });

		// Error from MOMO
		if (!contract) {
			const error = new HttpError({
				message: MSG_NOT_FOUND + ' requestId: ' + requestId,
				errorCode: ERROR_MOMO,
			});
			Logger.error(error.message, error);
			return res.sendStatus(204);
		}

		if (contract.deleted) {
			const error = new HttpError({
				message: MSG_SALE_ARE_DELETED + ' requestId: ' + requestId,
				errorCode: ERROR_MOMO,
			});
			Logger.error(error.message, error);
			return res.sendStatus(204);
		}

		const ipnClient = contract.ipnUrl;
		const sale = await Sale.findOne({ _id: contract.sale });

		// Giao dịch đã được xử lý thành công trả về MSG và thông tin sale
		if (sale.isSuccess) {
			Logger.info(MSG_TRADE_WAS_SLOVED, { sale });
			return res.sendStatus(204);
		}

		const isValidSignature = momoService.checkValidSignatureFromMomo(
			signature,
			sale.price,
			extraData,
			message,
			contract.sale.toString(),
			orderInfo,
			orderType,
			payType,
			contract.requestId,
			responseTime,
			resultCode,
			transId
		);

		// Chữ ký từ Momo không hợp lệ
		if (!isValidSignature) {
			const error = new HttpError({
				status: 400,
				message: MSG_INVALID_SIGNATURE,
				errorCode: ERROR_DIFF_SIGNATURE,
			});
			Logger.error(MSG_INVALID_SIGNATURE, {
				momoBody: body,
				error,
			});
			return res.sendStatus(204);
		}

		const solvedSale = await contractService.solveContractMomo(
			contract,
			payType,
			resultCode,
			message,
			signature,
			responseTime
		);

		if (solvedSale) {
			const body: MoMo.IParamsMomoReturnToApp = {
				orderId: sale.orderId,
				price: amount,
				statusCode: EnumStatus.SOLVE_SUCCESS,
				signature1st: contract.signature1st,
				signature2nd: contract.signature2nd,
				timeResponse: new Date().getTime(),
				typePaid: payType,
				saleId: sale.id,
				message: message,
			};
			Logger.info('Send data to ' + ipnClient);
			console.log(body);
			await postData(
				ipnClient,
				successCreator(200, MSG_SUCCESS, body)
			).catch((error) => Logger.error(error.message));
		} else {
			const error = new HttpError({
				status: 400,
				message: message,
				errorCode: 'MOMO-' + resultCode,
			});
			Logger.error(message, error);
		}
		// Feedback to Momo Service
		return res.sendStatus(204);
	}

	async redirectGatewayMomo(req: Request, res: Response, next: NextFunction) {
		Logger.info('Momo comming on browser');
		const query = await momoDto.redirecMomoPage(req);
		const {
			orderId,
			requestId,
			amount,
			orderInfo,
			orderType,
			transId,
			resultCode,
			message,
			payType,
			responseTime,
			extraData,
			signature,
		} = query;

		const contract = await Contract.findOneWithDeleted({ requestId });

		// Error from Momo or client or Order
		if (!contract) {
			const error = new HttpError({
				message: MSG_NOT_FOUND + ' requestId: ' + requestId,
				errorCode: ERROR_MOMO,
			});
			throw new HttpError({ message: error.message, status: 400 }, error);
		}

		const redirectUrl = contract.redirectUrl;
		let redirectLink: string = '';
		const sale = await Sale.findOneWithDeleted({ _id: contract.sale });

		const params: MoMo.IParamsMomoReturnToApp = {
			orderId: sale.orderId,
			price: amount,
			statusCode: EnumStatus.REJECT,
			signature1st: '',
			signature2nd: '',
			timeResponse: new Date().getTime(),
			typePaid: payType || '',
			saleId: sale.id,
			message: message,
		};

		if (!sale) {
			params.message = MSG_NOT_FOUND;
			redirectLink = url.format({
				pathname: redirectUrl,
				query: params as any,
			});
			return res.redirect(redirectLink);
		}

		if (sale.deleted) {
			redirectLink = url.format({
				pathname: redirectUrl,
				query: params as any,
			});
			return res.redirect(redirectLink);
		}

		if (sale.isSuccess) {
			Logger.info(MSG_TRADE_WAS_SLOVED, { sale });
			params.statusCode = EnumStatus.WAS_SOLVE_SUCCESS;
			params.message = MSG_TRADE_WAS_SLOVED;
			redirectLink = url.format({
				pathname: redirectUrl,
				query: params as any,
			});
			return res.redirect(redirectLink);
		}

		const isValidSignature = momoService.checkValidSignatureFromMomo(
			signature,
			sale.price,
			extraData,
			message,
			contract.sale.toString(),
			orderInfo,
			orderType,
			payType,
			contract.requestId,
			responseTime,
			resultCode,
			transId
		);
		// Chữ ký từ Momo hoặc trên query search không hợp lệ
		if (!isValidSignature) {
			Logger.error(MSG_INVALID_SIGNATURE, {
				clientQuery: query,
			});
			params.message = MSG_INVALID_SIGNATURE;
			redirectLink = url.format({
				pathname: redirectUrl,
				query: params as any,
			});
			return res.redirect(redirectLink);
		}
		const solvedContract = await contractService.solveContractMomo(
			contract,
			payType,
			resultCode,
			message,
			signature,
			responseTime
		);
		if (solvedContract) {
			params.signature1st = contract.signature1st;
			params.signature2nd = contract.signature2nd;
			params.statusCode = EnumStatus.SOLVE_SUCCESS;
			params.message = message;
		}
		redirectLink = url.format({
			pathname: redirectUrl,
			query: params as any,
		});
		Logger.info('Redirect to ' + redirectLink);
		return res.redirect(redirectLink);
	}
}
