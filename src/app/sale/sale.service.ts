import { IClientDocument } from '../../models/client.model';
import { Sale } from '../../models';

export class SaleService {
	async initNewSale(clientAKB: IClientDocument, payload: any) {
		return await Sale.create({
			orderId: payload.orderId,
			saleAmmount: 1,
			saleAmmountPaid: 0,
			price: payload.price,
			saleInfo: payload.saleInfo,
			timeCreated: new Date().getTime(),
			extraData: payload.extraData,
			client: clientAKB._id,
			...(payload.userInfo ? { userInfo: payload.userInfo } : {}),
			...(payload.storeId ? { storeId: payload.storeId } : {}),
			...(payload.tax ? { tax: payload.tax } : {}),
			...(payload.items ? { items: payload.items } : {}),
			isSuccess: false,
			statusCode: 'creating',
		});
	}
}

export default new SaleService();
