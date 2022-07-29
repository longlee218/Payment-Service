import { Schema, Types, model } from 'mongoose';
import mongooseDelete, {
	SoftDeleteDocument,
	SoftDeleteModel,
} from 'mongoose-delete';

import Client from './client.model';
import Sale from './sale.model';
import { mongoErrorE11000 } from '../utils/MongoError';
import mongoosePaginate from 'mongoose-paginate-v2';

export interface IContractDocument extends SoftDeleteDocument {
	requestId: string;
	sale: Types.ObjectId;
	requestTime: number;
	responseTime: number;
	client: Types.ObjectId;
	transId?: number;
	transType: string;
	transMethod?: string;
	statusCode?: string;
	isSuccess: Boolean;
	mac?: string;
	message: string;
	signature1st?: string;
	signature2nd?: string;
	signature3rd?: string;
	ipnUrl: string;
	redirectUrl: string;
}

const ContractSchema = new Schema(
	{
		requestId: {
			type: String,
			required: true,
		},
		sale: {
			type: Schema.Types.ObjectId,
			ref: Sale,
		},
		requestTime: {
			type: Number,
			required: true,
		},
		responesTime: Number,
		client: {
			type: Schema.Types.ObjectId,
			ref: Client,
		},
		transId: Number,
		transType: String,
		transMethod: String,
		statusCode: String,
		message: String,
		signature1st: String,
		signature2nd: String,
		signature3rd: String,
		ipnUrl: String,
		redirectUrl: String,
		isSuccess: {
			type: String,
			required: true,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

ContractSchema.plugin(mongooseDelete, {
	deletedBy: true,
	deletedByType: String,
});

ContractSchema.plugin(mongoosePaginate);
ContractSchema.post('save', mongoErrorE11000);
ContractSchema.post('updateOne', mongoErrorE11000);
ContractSchema.post('update', mongoErrorE11000);
ContractSchema.post('findOneAndUpdate', mongoErrorE11000);
ContractSchema.post('insertMany', mongoErrorE11000);

ContractSchema.methods.getServiceWorking = async function () {};

export interface IContract extends IContractDocument {}

export interface IContractModel extends SoftDeleteModel<IContract> {}

const Contract = model<IContract, IContractModel>('contracts', ContractSchema);
export default Contract;
