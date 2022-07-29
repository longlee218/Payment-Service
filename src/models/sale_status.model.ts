import { Model, PaginateModel, Schema, model } from 'mongoose';
import mongooseDelete, { SoftDeleteDocument } from 'mongoose-delete';

import { mongoErrorE11000 } from '../utils/MongoError';
import mongoosePaginate from 'mongoose-paginate-v2';

interface ISaleStatusDocument extends SoftDeleteDocument {
	code: number;
	desc: string;
}

const SaleStatusSchema = new Schema(
	{
		code: {
			type: Number,
			required: true,
		},
		desc: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);
SaleStatusSchema.plugin(mongooseDelete, {
	deletedBy: true,
	deletedByType: String,
});
SaleStatusSchema.plugin(mongoosePaginate);

SaleStatusSchema.post('save', mongoErrorE11000);
SaleStatusSchema.post('updateOne', mongoErrorE11000);
SaleStatusSchema.post('update', mongoErrorE11000);
SaleStatusSchema.post('findOneAndUpdate', mongoErrorE11000);
SaleStatusSchema.post('insertMany', mongoErrorE11000);

export interface ISaleStatus extends ISaleStatusDocument {}

export interface ISaleStatusModel extends Model<ISaleStatus> {}

const SaleStatus = model<ISaleStatus, PaginateModel<ISaleStatusModel>>(
	'sale_status',
	SaleStatusSchema
);
export default SaleStatus;
