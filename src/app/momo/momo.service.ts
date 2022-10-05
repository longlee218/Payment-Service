import {
	API_V1,
	APP_NAME,
	MOMO_ACCESS_KEY,
	MOMO_PARTNER_CODE,
	MOMO_PUBLIC_KEY,
	MOMO_SECRET_KEY,
} from '../../config/key';
import { MOMO_PAYMENT_IPN, MOMO_PAYMENT_REDIRECT } from '../../config/route';
import { encrypted_Base64, encrypted_Hmac_SHA256 } from '../../helpers/encode';
import {
	httpsOptionsCheckStatusTrans,
	httpsOptionsRequirePaymentMethod,
} from '../../config/momo';

import { ERROR_MOMO } from '../../config/error';
import HttpError from '../../utils/HttpError';
import { IClientDocument } from '../../models/client.model';
import { IncomingMessage } from 'http';
import Logger from '../../core/logger';
import { MoMo } from '../../types/momo';
import { Types } from 'mongoose';
import contractService from '../contract/contract.service';
import https from 'https';

export class MomoService {
	private _makeMomoRequestId(appName: string) {
		return MOMO_PARTNER_CODE + '-' + appName + '-' + new Date().getTime();
	}

	private _makeIPNAndRedirectUrl(fullHost: string) {
		const ipnUrl = fullHost + API_V1 + MOMO_PAYMENT_IPN;
		// const ipnUrl = HOOK_MOMO;
		const redirectUrl = fullHost + MOMO_PAYMENT_REDIRECT;
		return { ipnUrl, redirectUrl };
	}

	// Lấy phương thức thanh toán từ Momo
	async getPaymentTypeFromMomo(
		clientAKB: IClientDocument,
		saleId: Types.ObjectId,
		fullHost: string,
		payload: {
			storeId?: string;
			amount: number;
			orderId: string | number;
			orderInfo: string;
			extraData?: string;
			items?: Array<any>;
			userInfo?: object;
			ipnUrlClient: string;
			redirectUrlClient: string;
			signature1st: string;
		},
		callback: Function
	) {
		try {
			const storeId = payload.storeId || clientAKB.appName;
			const requestId = this._makeMomoRequestId(clientAKB.appName);
			const { ipnUrl, redirectUrl } = this._makeIPNAndRedirectUrl(fullHost);
			const base64ExtraData = encrypted_Base64(
				payload?.extraData || '',
				MOMO_PUBLIC_KEY
			);
			const rawSignature = this._makeRawSignature2nd(
				payload.amount,
				base64ExtraData,
				ipnUrl,
				payload.orderId,
				payload.orderInfo,
				redirectUrl,
				requestId
			);
			const signature = encrypted_Hmac_SHA256(rawSignature, MOMO_SECRET_KEY);
			// save into constact
			await contractService.initContractMomo(
				{
					requestId: requestId,
					saleId: saleId,
					clientId: clientAKB._id,
					transType: 'momo',
					signature1st: payload.signature1st,
					signature2nd: signature,
					ipnUrl: payload.ipnUrlClient, // IPN của các ứng dụng
					redirectUrl: payload.redirectUrlClient, // Redirect của các ứng dụng
				},
				callback
			);

			const momoRequest: MoMo.IRequestPaymentType = {
				partnerCode: MOMO_PARTNER_CODE,
				partnerName: APP_NAME,
				storeId: storeId,
				requestId: requestId,
				amount: payload.amount,
				orderId: payload.orderId.toString(),
				orderInfo: payload.orderInfo,
				redirectUrl,
				ipnUrl,
				extraData: base64ExtraData,
				requestType: 'captureWallet',
				...(payload.items ? { items: payload.items } : {}),
				...(payload.userInfo ? { userInfo: payload.userInfo } : {}),
				signature: signature,
				lang: 'vi',
			};
			Logger.info('Data send to momo::', momoRequest);
			return this._rqGetPaymentTypeToMomo(momoRequest, callback);
		} catch (error) {
			throw new Error(error);
		}
	}

	private _rqGetPaymentTypeToMomo(
		momoRequest: MoMo.IRequestPaymentType,
		callback: Function
	) {
		const requestBody = JSON.stringify(momoRequest);
		const request = https.request(
			{
				...httpsOptionsRequirePaymentMethod,
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': Buffer.byteLength(requestBody),
				},
			},
			(response: IncomingMessage) => {
				response.setEncoding('utf8');
				response.on('data', (body) => {
					const { statusCode, statusMessage } = response;
					try {
						const bodyParse = JSON.parse(body);
						if (statusCode < 200 || statusCode > 299) {
							const error = new HttpError({
								message: bodyParse.message,
								errorCode: bodyParse.resultCode,
								status: statusCode,
								isOperational: true,
							});
							callback(error, null);
						} else {
							callback(null, bodyParse);
						}
					} catch (error) {
						const httpError = new HttpError({
							message: statusMessage || body,
							errorCode: ERROR_MOMO,
							status: statusCode,
						});
						callback(httpError, null);
					}
				});
				response.on('end', () => {
					console.log('No more data in response.');
				});
			}
		);
		request.on('error', (error: Error) => {
			callback(error, null);
		});
		request.write(requestBody);
		request.end();
	}

	public reqGetTransStatusToMomo(
		orderId: string,
		requestId: string,
		callback: Function
	) {
		const rawSignature = this._makeRawSignatureCheck(orderId, requestId);
		const requestCheckStatusTrans = {
			partnerCode: MOMO_PARTNER_CODE,
			requestId,
			orderId,
			lang: 'vi',
			// signature: encrypted_Base64(rawSignature, MOMO_SECRET_KEY),
		};
		const requestBody = JSON.stringify(requestCheckStatusTrans);
		const request = https.request(
			{
				...httpsOptionsCheckStatusTrans,
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': Buffer.byteLength(requestBody),
				},
			},
			(response: IncomingMessage) => {
				response.setEncoding('utf8');
				response.on('data', (body) => {
					const { statusCode, statusMessage } = response;
					try {
						const bodyParse = JSON.parse(body);
						if (statusCode < 200 || statusCode > 299) {
							const error = new HttpError({
								message: bodyParse.message,
								errorCode: bodyParse.resultCode,
								status: statusCode,
								isOperational: true,
							});
							callback(error, null);
						} else {
							callback(null, bodyParse);
						}
					} catch (error) {
						const httpError = new HttpError({
							message: statusMessage || body,
							errorCode: ERROR_MOMO,
							status: statusCode,
						});
						callback(httpError, null);
					}
				});
				response.on('end', () => {
					console.log('No more data in response.');
				});
			}
		);
		request.on('error', (error: Error) => {
			callback(error, null);
		});
		request.write(requestBody);
		request.end();
	}

	private _makeRawSignature2nd(
		amount: number,
		extraData: string,
		ipnUrl: string,
		orderId: string | number,
		orderInfo: string,
		redirectUrl: string,
		requestId: string,
		requestType: string = 'captureWallet'
	): string {
		return `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_PARTNER_CODE}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
	}

	private _makeRawSignature3rd(
		amount: number,
		extraData: string,
		message: string,
		orderId: string | number,
		orderInfo: string,
		orderType: string,
		payType: string,
		requestId: string,
		responseTime: number,
		resultCode: number,
		transId: string | number
	) {
		return `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${MOMO_PARTNER_CODE}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
	}

	private _makeRawSignatureCheck(orderId: string, requestId: string) {
		return `accessKey=${MOMO_ACCESS_KEY}&orderId=${orderId}&partnerCode=${MOMO_PARTNER_CODE}&requestId=${requestId}`;
	}

	checkValidSignatureFromMomo(
		signature: string,
		amount: number,
		extraData: string,
		message: string,
		orderId: string | number,
		orderInfo: string,
		orderType: string,
		payType: string,
		requestId: string,
		responseTime: number,
		resultCode: number,
		transId: string | number
	): boolean {
		const rawSignature3rd = this._makeRawSignature3rd(
			amount,
			extraData,
			message,
			orderId,
			orderInfo,
			orderType,
			payType,
			requestId,
			responseTime,
			resultCode,
			transId
		);

		Logger.info('raw signature: ' + rawSignature3rd);

		const signature3rd = encrypted_Hmac_SHA256(
			rawSignature3rd,
			MOMO_SECRET_KEY
		);
		return signature === signature3rd;
	}
}

export default new MomoService();
