import { Contract, Sale } from '../../models';

import { IContract } from '../../models/contract.model';
import { ISale } from '../../models/sale.model';
import { Types } from 'mongoose';

export class ContractService {
	async initContractMomo(
		payload: {
			requestId: string;
			saleId: Types.ObjectId;
			clientId: Types.ObjectId;
			signature1st: string;
			signature2nd: string;
			transType: 'momo' | 'zalopay';
			ipnUrl: string;
			redirectUrl: string;
		},
		callback: Function
	) {
		return await Contract.create({
			requestId: payload.requestId,
			sale: payload.saleId,
			requestTime: new Date().getTime(),
			client: payload.clientId,
			transType: payload.transType,
			isSuccess: false,
			message: 'Đang gửi tới ' + payload.transType,
			signature1st: payload.signature1st,
			signature2nd: payload.signature2nd,
			ipnUrl: payload.ipnUrl,
			redirectUrl: payload.redirectUrl,
		}).catch((error) => callback(new Error(error), null));
	}

	async solveContractMomo(
		contract: IContract,
		payType: string,
		resultCode: number,
		message: string,
		signature3rd: string,
		responseTime: number
	): Promise<ISale | null> {
		const isSuccess = resultCode === 0 || resultCode === 9000;
		await contract.updateOne({
			message,
			transType: payType,
			signature3rd,
			isSuccess,
			responseTime,
		});
		if (isSuccess) {
			return await Sale.findByIdAndUpdate(
				contract.sale,
				{
					paymentType: payType,
					isSuccess: true,
					saleAmmountPaid: 1,
					statusCode: 'success',
					timePaid: responseTime,
				},
				{
					new: true,
				}
			);
		}
		await contract.deleteOne();
		await Sale.findByIdAndDelete(contract.sale);
		return null;
	}
}

export default new ContractService();
