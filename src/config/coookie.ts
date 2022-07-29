import { CookieOptions } from 'express';
import { APP_DOMAIN } from './key';

const cookieToken: CookieOptions = {
	maxAge: 1000 * 60 * 15, //expire after 15 mins
	httpOnly: true,
	signed: true,
	secure: true, // Change to true if https
	path: '/',
	domain: APP_DOMAIN,
	sameSite: 'none',
	expires: new Date(Date.now() + 1000 * 60 * 15),
};

export default cookieToken;
