import NodeCache from 'node-cache';

const ServerCache = new NodeCache({
	stdTTL: 60 * 20, // 20 mins life,
	checkperiod: 600, // check after 10 mins
	deleteOnExpire: true,
});

export default ServerCache;
