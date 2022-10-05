import ActionCreator from '../../utils/ActionCreator';
import { MOMO_PAYMENT_REDIRECT } from '../../config/route';
import MomoPaymentController from './momo.controller';
import express from 'express';

const router = express.Router();

router.get(
	MOMO_PAYMENT_REDIRECT,
	ActionCreator(MomoPaymentController, 'redirectGatewayMomo')
);

export default router;
