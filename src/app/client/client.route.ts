import { CLIENT_ROUTE, CLIENT_VAR_ROUTE, WHO_AM_I } from '../../config/route';

import CatchAsync from '../../utils/CatchAsync';
import { authClientMiddleware } from '../../middlewares/auth.middleware';
import clientController from './client.controller';
import express from 'express';

const router = express.Router();

router.get(
	WHO_AM_I,
	CatchAsync(authClientMiddleware),
	CatchAsync(clientController.whoAmI.bind(clientController))
);

router
	.route(CLIENT_ROUTE)
	.get(
		CatchAsync(authClientMiddleware),
		CatchAsync(clientController.get.bind(clientController))
	)
	.post(CatchAsync(clientController.create.bind(clientController)));

router.get(
	CLIENT_VAR_ROUTE,
	CatchAsync(authClientMiddleware),
	CatchAsync(clientController.find.bind(clientController))
);

router
	.route(CLIENT_VAR_ROUTE)
	.put(
		CatchAsync(authClientMiddleware),
		CatchAsync(clientController.update.bind(clientController))
	)
	.delete(
		CatchAsync(authClientMiddleware),
		CatchAsync(clientController.delete.bind(clientController))
	);

export default router;
