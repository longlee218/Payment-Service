import express, { Express } from 'express';

import { API_V1 } from '../config/key';
import Logger from './logger';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from './cors';
import helmet from 'helmet';
import path from 'path';
import userAgent from 'express-useragent';

function InitExpress(port: number | string | boolean) {
	const app: Express = express();

	app.set('port', port);
	app.set('view engine', 'ejs');
	app.set('views', path.join(__dirname, '..', 'views'));

	app.use(function (req, res, next) {
		res.header('Access-Control-Allow-Credentials', 'true');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.header(
			'Access-Control-Allow-Headers',
			'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json'
		);
		next();
	});
	app.use('/public', express.static(path.join(__dirname, '..', 'public')));
	app.use(helmet());
	app.use(cors);
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(
		cookieParser(
			process.env.COOKIE_SECRET || 'y!e.[qC7tO35&5~6=0LucW:K5Mok9+'
		)
	);
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(userAgent.express());

	app.use('/', (req, res, next) => {
		req.fullHost = req.protocol + '://' + req.get('host');
		Logger.info(req.method.toUpperCase() + ' ' + req.path);
		next();
	});

	app.get('/', (req, res) => res.send('Payment service AKB'));

	app.get(API_V1, (req, res) =>
		res.send('This is version 1 AKB Payment api.')
	);

	return app;
}

export default InitExpress;
