import { Model, PaginateModel, Schema, Types, model } from 'mongoose';
import mongooseDelete, {
	SoftDeleteDocument,
	SoftDeleteModel,
} from 'mongoose-delete';

import Client from './client.model';
import { mongoErrorE11000 } from '../utils/MongoError';
import mongoosePaginate from 'mongoose-paginate-v2';

interface ISaleDocument extends SoftDeleteDocument {
	orderId: string | number;
	storeId?: string | number;
	tax?: number;
	saleAmmmount: number;
	saleAmmountPaid: number;
	price: number;
	currency?: string;
	saleInfo: string;
	timeCreated: number;
	timePaid?: number;
	extraData: string;
	userInfo?: string;
	client: Types.ObjectId;
	paymentMethod?: string; // qr or card
	paymentType?: string; // momo or zalo
	statusCode: string;
	isSuccess: Boolean;
}

function isMyFieldRequired() {
	return typeof this.extraData === 'string' ? false : true;
}

const SaleSchema = new Schema(
	{
		orderId: {
			type: String,
			required: true,
		},
		storeId: String,
		tax: Number,
		saleAmmount: {
			type: Number,
			default: 1,
		},
		saleAmmountPaid: {
			type: Number,
			default: 1,
		},
		price: {
			type: Number,
			required: true,
		},
		currency: {
			type: String,
			required: true,
			default: 'VND',
		},
		saleInfo: {
			type: String,
			required: true,
		},
		timeCreated: {
			type: Number,
			required: true,
		},
		timePaid: Number,
		extraData: {
			type: String,
			required: isMyFieldRequired,
		},
		userInfo: String,
		client: {
			type: Schema.Types.ObjectId,
			ref: Client,
		},
		items: String,
		paymentMethod: String,
		paymentType: String,
		statusCode: {
			type: String,
			required: true,
		},
		isSuccess: { type: Boolean, required: true, default: false },
	},
	{
		timestamps: true,
	}
);
SaleSchema.plugin(mongooseDelete, {
	deletedAt: true,
	deletedByType: String,
	overrideMethods: true,
});
SaleSchema.plugin(mongoosePaginate);

SaleSchema.post('save', mongoErrorE11000);
SaleSchema.post('updateOne', mongoErrorE11000);
SaleSchema.post('update', mongoErrorE11000);
SaleSchema.post('findOneAndUpdate', mongoErrorE11000);
SaleSchema.post('insertMany', mongoErrorE11000);

SaleSchema.set('toJSON', {
	transform: (
		_: any,
		r: {
			__v: number;
			createdAt: any;
			updatedAt: any;
			deleted: boolean;
			deletedAt: any;
		}
	) => {
		delete r.__v;
		delete r.createdAt;
		delete r.updatedAt;
		delete r.deleted;
		delete r.deletedAt;
		return r;
	},
});

export interface ISale extends ISaleDocument {}

export interface ISaleModel
	extends SoftDeleteModel<ISale>,
		PaginateModel<ISale> {}

const Sale = model<ISale, ISaleModel>('sales', SaleSchema);
export default Sale;
