import { MOMO_PAYMENT_IPN, MOMO_PAYMENT_ROUTE } from '../../config/route';

import ActionCreator from '../../utils/ActionCreator';
import MomoPaymentController from './momo.controller';
import { authClientMiddleware } from '../../middlewares/auth.middleware';
import express from 'express';

const router = express.Router();

router.post(
	MOMO_PAYMENT_ROUTE,
	authClientMiddleware,
	ActionCreator(MomoPaymentController, 'requirePayment')
);

router.post(
	MOMO_PAYMENT_IPN,
	ActionCreator(MomoPaymentController, 'ipnSolveMomo')
);

export default router;
