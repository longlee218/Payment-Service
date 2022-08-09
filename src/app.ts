import https, { ServerOptions } from 'https';

import Bootstrap from './core/bootstrap';
import Logger from './core/logger';
import dotenv from 'dotenv';
import fs from 'fs';
import { normalizePort } from './helpers/port';
import path from 'path';

dotenv.config({
	path: path.join(process.cwd(), '.env'),
});
/**
 * App Variables
 */
const port = normalizePort(process.env.PORT || '8080');
const app = Bootstrap(port);

/**
 * Event listener for HTTP server "error" event.
 */
const onError = (error: any) => {
	if (error.syscall !== 'listen') {
		throw error;
	}
	const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
	switch (error.code) {
		case 'EACCES':
			Logger.error(bind + ' requires elevated privileges');
			process.exit(1);
		case 'EADDRINUSE':
			Logger.error(bind + ' is already in use');
			process.exit(1);
		default:
			throw error;
	}
};

const onListenning = () => {
	const addr = httpsServer.address();
	const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	Logger.info('express listening on ' + bind);
};

const domainSSLPath = path.join(__dirname, '../.cert', 'fin.akb.vn');
const httpsOptions: ServerOptions = {
	key: fs.readFileSync(domainSSLPath + '/fin.akb.vn-key.pem'),
	cert: fs.readFileSync(domainSSLPath + '/fin.akb.vn-crt.pem'),
	ca: fs.readFileSync(domainSSLPath + '/fin.akb.vn-chain.pem'),
	// requestCert: false,
	// rejectUnauthorized: false,
};

/**
 * Server Activation
 */
const httpsServer = https.createServer(httpsOptions, app);
httpsServer.listen(port);
httpsServer.on('listening', onListenning);
httpsServer.on('error', onError);

/**
 * Catch error process
 */
process.on('uncaughtException', (err) => {
	Logger.error('Error process: ' + err.message, err);
});
