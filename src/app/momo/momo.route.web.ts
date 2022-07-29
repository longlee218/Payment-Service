import CatchAsync from '../../utils/CatchAsync';
import { MOMO_PAYMENT_REDIRECT } from '../../config/route';
import express from 'express';
import momoController from './momo.controller';

const router = express.Router();

router.get(
	MOMO_PAYMENT_REDIRECT,
	CatchAsync(momoController.redirectGatewayMomo)
);

export default router;
