import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
	path: path.join(process.cwd(), '.env'),
});
export const API_V1 = '/api/v1';
export const MODE = process.env.MODE;
export const APP_NAME = process.env.APP_NAME;

export const DB_HOST = process.env.DB_HOST || 'mongodb://localhost:27017';
export const DB_AUTHSOURCE = process.env.DB_AUTHSOURCE;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME || 'manage_service';

export const HEADER_X_API_KEY = 'x-api-key';

export const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE;
export const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
export const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY;

export const MOMO_HOST_DEVELOP = 'test-payment.momo.vn';
export const MOMO_HOST_PRODUCT = 'payment.momo.vn';
export const MOMO_PUBLIC_KEY = process.env.MOMO_PUBLIC_KEY;

// export const MOMO_API_GATEWAY = '/v2/gateway/api/create';
export const MOMO_API_GATEWAY = process.env.MOMO_API_GATEWAY;

export const PUBLIC_KEY = process.env.PUBLIC_KEY;
export const APP_DOMAIN = process.env.APP_DOMAIN;
export const APP_HOST = process.env.APP_HOST;
