import { Client } from '../../models';
import { Types } from 'mongoose';

export class ClientService {
	async getByToken(token: string) {
		return await Client.findOne({ token });
	}

	async findClientById(id: Types.ObjectId | string) {
		return await Client.findOne({
			_id: typeof id === 'string' ? new Types.ObjectId(id) : id,
			isActive: true,
			deleted: false,
		});
	}
}

export default new ClientService();
