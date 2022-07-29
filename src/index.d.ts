import { IClientDocument } from './models/client.model';

declare global {
	namespace Express {
		interface Request {
			clientAKB: IClientDocument;
			fullHost: string;
		}
	}
}
