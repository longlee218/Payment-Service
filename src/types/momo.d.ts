import { EnumStatus } from '../config/enum';

declare namespace MoMo {
	export interface IRequestPaymentType {
		partnerCode: string;
		partnerName?: string;
		storeId?: string;
		requestId: string;
		amount: number;
		orderId: string;
		orderInfo: string;
		orderGroupId?: string;
		redirectUrl: string;
		ipnUrl: string;
		requestType: 'captureWallet';
		extraData: string;
		items?: Array<IItems>;
		userInfo?: object;
		autoCapture?: boolean;
		lang: 'vi' | 'en';
		signature: string;
	}

	export interface IItems {
		id: string;
		name: string;
		description?: string;
		category?: string;
		imageUrl?: string;
		manufacturer?: string;
		price: number;
		currency: 'VND' | 'USD';
		quantity: number;
		unit?: string;
		totalPrice: number;
		taxAmount?: number;
	}

	export interface IParamsMomoReturnToApp {
		orderId: string | number;
		price: string;
		statusCode: EnumStatus;
		signature1st?: string;
		signature2nd?: string;
		timeResponse: number;
		typePaid?: string;
		saleId?: string;
		message: string;
	}
}
