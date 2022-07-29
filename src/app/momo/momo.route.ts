import { MOMO_PAYMENT_IPN, MOMO_PAYMENT_ROUTE } from '../../config/route';

import CatchAsync from '../../utils/CatchAsync';
import { authClientMiddleware } from '../../middlewares/auth.middleware';
import express from 'express';
import momoController from './momo.controller';

const router = express.Router();

router.post(
	MOMO_PAYMENT_ROUTE,
	CatchAsync(authClientMiddleware),
	CatchAsync(momoController.requirePayment)
);

router.post(MOMO_PAYMENT_IPN, CatchAsync(momoController.ipnSolveMomo));

export default router;
