import { Contract, Sale } from '../../models';
import { ERROR_DIFF_SIGNATURE, ERROR_MOMO } from '../../config/error';
import HttpResponse, {
	errorCreator,
	successCreator,
} from '../../utils/HttpResponse';
import {
	MSG_INVALID_SIGNATURE,
	MSG_NOT_FOUND,
	MSG_SUCCESS,
	MSG_TRADE_WAS_SLOVED,
} from '../../config/lang';
import { NextFunction, Request, Response } from 'express';

import HttpError from '../../utils/HttpError';
import Logger from '../../core/logger';
import contractService from '../contract/contract.service';
import momoDto from './momo.dto';
import momoService from './momo.service';
import { postData } from '../../services/requestToServer';
import saleService from '../sale/sale.service';
import url from 'url';

export class MomoPayment {
	async requirePayment(req: Request, res: Response, next: NextFunction) {
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
		} = await momoDto.requirePayment(req);
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

		const contract = await Contract.findOne({ requestId });

		// Error from MOMO
		if (!contract) {
			const error = new HttpError({
				message: MSG_NOT_FOUND + ' requestId: ' + requestId,
				errorCode: ERROR_MOMO,
			});
			Logger.error(error.message, error);
			return res.sendStatus(204);
		}
		const ipnClient = contract.ipnUrl;
		const sale = await Sale.findOne({ _id: contract.sale });

		if (sale.isSuccess) {
			Logger.info(MSG_TRADE_WAS_SLOVED, { sale });
			await postData(
				ipnClient,
				successCreator(200, MSG_TRADE_WAS_SLOVED, sale)
			);
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

		if (!isValidSignature) {
			const error = new HttpError({
				status: 400,
				message: MSG_INVALID_SIGNATURE,
				errorCode: ERROR_DIFF_SIGNATURE,
			});
			Logger.error(MSG_INVALID_SIGNATURE, {
				momoBody: body,
			});
			await postData(ipnClient, errorCreator(error));
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
		await postData(ipnClient, successCreator(200, MSG_SUCCESS, solvedSale));
		// Feedback to Momo Service
		return res.sendStatus(204);
	}

	async redirectGatewayMomo(req: Request, res: Response, next: NextFunction) {
		Logger.info('Momo comming on browser');
		const query = await momoDto.redirecMomoPage(req);
		const {
			partnerCode,
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
		const contract = await Contract.findOne({ requestId });

		// Error from Momo or client
		if (!contract) {
			const error = new HttpError({
				message: MSG_NOT_FOUND + ' requestId: ' + requestId,
				errorCode: ERROR_MOMO,
			});
			throw new HttpError({ message: error.message, status: 400 }, error);
		}
		const redirectUrl = contract.redirectUrl;
		const sale = await Sale.findOne({ _id: contract.sale });
		if (sale.isSuccess) {
			Logger.info(MSG_TRADE_WAS_SLOVED, { sale });
			return res.redirect(
				url.format({
					pathname: redirectUrl,
					query: {
						orderId: orderId,
						price: amount,
						solved: 0,
						resolved: 1,
					},
				})
			);
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

		// Error from client or Momo
		if (!isValidSignature) {
			Logger.error(MSG_INVALID_SIGNATURE, {
				clientQuery: query,
			});
			throw new HttpError({
				status: 400,
				message: MSG_INVALID_SIGNATURE,
				errorCode: ERROR_DIFF_SIGNATURE,
			});
		}

		await contractService.solveContractMomo(
			contract,
			payType,
			resultCode,
			message,
			signature,
			responseTime
		);

		return res.redirect(
			url.format({
				pathname: redirectUrl,
				query: {
					orderId: orderId,
					price: amount,
					solved: 1,
					resolved: 1,
					signature: contract.signature2nd,
				},
			})
		);
	}
}

export default new MomoPayment();
