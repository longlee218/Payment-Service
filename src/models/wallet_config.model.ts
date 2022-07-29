import { Schema, model } from 'mongoose';

interface IWalletConfig {
	name: string;
	config: any;
}

const WalletConfigSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
		},
		config: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Setting = model<IWalletConfig>('wallet_configs', WalletConfigSchema);
export default Setting;
