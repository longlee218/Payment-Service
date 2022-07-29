import { Schema, model } from 'mongoose';
import mongooseDelete, {
	SoftDeleteDocument,
	SoftDeleteModel,
} from 'mongoose-delete';

import { makeRandomStr } from '../helpers/random';
import { mongoErrorE11000 } from '../utils/MongoError';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IClientDocument extends SoftDeleteDocument {
	token: string;
	appName: string;
	redirectUrl: string;
	ipnUrl: string;
	isActive: boolean;
	isOffice: boolean;
}

const ClientSchema = new Schema(
	{
		token: {
			type: String,
			unique: String,
		},
		appName: {
			type: String,
			uppercase: true,
			trim: true,
			required: true,
			unique: true,
		},
		redirectUrl: {
			type: String,
			required: true,
		},
		ipnUrl: {
			type: String,
			required: true,
		},
		isActive: {
			type: Boolean,
			required: true,
			default: true,
		},
		isOffice: {
			type: Boolean,
			required: true,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

ClientSchema.plugin(mongooseDelete, {
	deletedBy: true,
	deletedByType: String,
});

ClientSchema.plugin(mongoosePaginate);

ClientSchema.pre('save', function (next) {
	if (this.isNew) {
		this.token = 'AKB-' + makeRandomStr(20);
	}
	next();
});

ClientSchema.post('save', mongoErrorE11000);
ClientSchema.post('updateOne', mongoErrorE11000);
ClientSchema.post('update', mongoErrorE11000);
ClientSchema.post('findOneAndUpdate', mongoErrorE11000);
ClientSchema.post('insertMany', mongoErrorE11000);

ClientSchema.methods.getServiceWorking = async function () {};

export interface IClient extends IClientDocument {}

export interface IClientModel extends SoftDeleteModel<IClient> {}

const Client = model<IClient, IClientModel>('clients', ClientSchema);
export default Client;
