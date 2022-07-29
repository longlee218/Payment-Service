import { MODE, MOMO_HOST_DEVELOP, MOMO_HOST_PRODUCT } from './key';

import { RequestOptions } from 'https';

export const httpsOptionsRequirePaymentMethod: RequestOptions = {
	hostname: MODE === 'production' ? MOMO_HOST_PRODUCT : MOMO_HOST_DEVELOP,
	port: 443,
	path: '/v2/gateway/api/create',
	method: 'POST',
};

export const httpsOptionsCheckStatusTrans: RequestOptions = {
	hostname: MODE === 'production' ? MOMO_HOST_PRODUCT : MOMO_HOST_DEVELOP,
	port: 443,
	path: '/v2/gateway/api/query',
	method: 'POST',
};
