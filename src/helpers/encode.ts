import NodeRSA from 'node-rsa';
import crypto from 'crypto';

export const encrypted_Base64 = (data: string, key: string) => {
	const nodeRSA = new NodeRSA(key, 'pkcs8');
	return nodeRSA.encrypt(Buffer.from(data), 'base64');
};

export const decrypted_Base64 = (
	encryptedData: string,
	key: string
): unknown => {
	const nodeRSA = new NodeRSA(key, 'pkcs8');
	return nodeRSA.decrypt(encryptedData, 'base64');
};

export const encrypted_Hmac_SHA256 = (data: string, key: string) =>
	crypto.createHmac('sha256', key).update(data).digest('hex');
