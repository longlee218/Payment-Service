import { API_V1, MODE } from '../config/key';

import Errorhandle from '../utils/ErrorHandle';
import InitExpress from './express';
import { MSG_SERVER_ERROR } from '../config/lang';
import { connectMongoDB } from './database';
import { errorCreator } from '../utils/HttpResponse';
import fs from 'fs';
import path from 'path';

function Bootstrap(port: number | string | boolean) {
	connectMongoDB();
	const app = InitExpress(port);

	const pathDirect = path.join(__dirname, '..', 'app');
	const dirs = fs
		.readdirSync(pathDirect, {
			withFileTypes: true,
		})
		.filter((dirent) => dirent.isDirectory());

	// Init route API
	let routeApiFiles: string[] = [];

	dirs.forEach((dir) => {
		const pathDirectSub = path.join(pathDirect, dir.name);
		const files = fs
			.readdirSync(pathDirectSub)
			.filter((file) => /\.route\.js$/.test(file))
			.map((file) => path.join('..', 'app', dir.name, file));
		routeApiFiles = routeApiFiles.concat(files);
	});
	Promise.all(routeApiFiles.map((path) => import(path)))
		.then((modules) =>
			modules.forEach((module) => app.use(API_V1, module.default))
		)
		.then(() => {
			app.use((error: any, req: any, res: any, next: any) =>
				Errorhandle(error, req, res, next)
			);
		});

	// Init route web
	let routeWebFiles: string[] = [];
	dirs.forEach((dir) => {
		const pathDirectSub = path.join(pathDirect, dir.name);
		const files = fs
			.readdirSync(pathDirectSub)
			.filter((file) => /\.route\.web\.js$/.test(file))
			.map((file) => path.join('..', 'app', dir.name, file));
		routeWebFiles = routeWebFiles.concat(files);
	});
	Promise.all(routeWebFiles.map((path) => import(path)))
		.then((modules) => modules.forEach((module) => app.use(module.default)))
		.then(() => {
			app.get('*', function (req, res) {
				res.status(404).send('Not found route: ' + req.path);
			});
		});
	return app;
}

export default Bootstrap;
