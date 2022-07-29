import { MSG_FORBIDDEN, MSG_NOT_FOUND, MSG_SUCCESS } from '../../config/lang';
import { NextFunction, Request, Response } from 'express';

import { Client } from '../../models';
import HttpError from '../../utils/HttpError';
import HttpResponse from '../../utils/HttpResponse';
import clientDto from './client.dto';

export class ClientController {
	async whoAmI(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<HttpResponse> {
		return new HttpResponse({ res, data: req.clientAKB });
	}

	async find(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<HttpResponse> {
		const id = req.params.id as string;
		const client = await Client.findById(id).orFail(
			new HttpError({ message: MSG_NOT_FOUND })
		);
		if (client.token !== req.clientAKB.token && !req.clientAKB.isOffice) {
			throw new HttpError({ status: 403, message: MSG_FORBIDDEN });
		}
		return new HttpResponse({ res, data: client });
	}

	async get(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<HttpResponse> {
		if (req.clientAKB.isOffice) {
			const clients = await Client.find();
			return new HttpResponse({ res, data: clients });
		}
		throw new HttpError({ status: 403, message: MSG_FORBIDDEN });
	}

	async create(
		req: Request,
		res: Response,
		next: NextFunction
	): Promise<HttpResponse> {
		const payload = await clientDto.create(req);
		const client = await Client.create(payload);
		return new HttpResponse({ res, data: client });
	}

	async update(req: Request, res: Response, next: NextFunction) {
		const id = req.params.id as string;
		const payload = await clientDto.create(req);

		const client = await Client.findById(id).orFail(
			new HttpError({ message: MSG_NOT_FOUND })
		);
		if (client.token !== req.clientAKB.token && !req.clientAKB.isOffice) {
			throw new HttpError({ status: 403, message: MSG_FORBIDDEN });
		}
		const clientUpdated = await Client.findOneAndUpdate(
			{ _id: id },
			payload,
			{ new: true }
		);
		return new HttpResponse({ res, data: clientUpdated });
	}

	async delete(req: Request, res: Response, next: NextFunction) {
		const id = req.params.id as string;
		const client = await Client.findById(id).orFail(
			new HttpError({ message: MSG_NOT_FOUND })
		);
		if (client.token !== req.clientAKB.token && !req.clientAKB.isOffice) {
			throw new HttpError({ status: 403, message: MSG_FORBIDDEN });
		}
		await Client.deleteById(id);
		return new HttpResponse({ res, statusCode: 204, msg: MSG_SUCCESS });
	}
}

export default new ClientController();
