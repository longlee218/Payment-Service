import { CLIENT_ROUTE, CLIENT_VAR_ROUTE, WHO_AM_I } from '../../config/route';

import ActionCreator from '../../utils/ActionCreator';
import ClientController from './client.controller';
import { authClientMiddleware } from '../../middlewares/auth.middleware';
import express from 'express';

const router = express.Router();

router
	.route(WHO_AM_I)
	.get(authClientMiddleware, ActionCreator(ClientController, 'whoAmI'));

router
	.route(CLIENT_ROUTE)
	.post(ActionCreator(ClientController, 'create'))
	.get(authClientMiddleware, ActionCreator(ClientController, 'get'));

router
	.route(CLIENT_VAR_ROUTE)
	.get(authClientMiddleware, ActionCreator(ClientController, 'find'))
	.put(authClientMiddleware, ActionCreator(ClientController, 'update'))
	.delete(authClientMiddleware, ActionCreator(ClientController, 'delete'));

export default router;
