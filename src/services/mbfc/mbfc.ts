import axios from 'axios';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { mkdirpSync } from 'fs-extra';
import { getByUrl } from 'mbfc-node';
import { MBFCData, Result } from 'mbfc-node/dist/interfaces';
import path from 'path';

export interface MBFCClientInterface {
	getMbfcForUrl(url: string): Result | null;
}

async function downloadMbfcData(): Promise<MBFCData> {
	const res = await axios.get('https://raw.githubusercontent.com/drmikecrowe/mbfcext/main/docs/v3/combined.json');
	if (!res.data || 'version' in res.data === false || 'date' in res.data === false) {
		console.error('Could not retrieve MBFC data');
	}
	mkdirpSync('cache');
	writeFileSync(path.join('cache', 'mbfc-data.json'), JSON.stringify(res.data));
	return res.data;
}

export class MBFCClient implements MBFCClientInterface {
	constructor(private data: MBFCData) {}

	getMbfcForUrl(url: string) {
		try {
			const result = getByUrl(url, this.data);
			return result;
		} catch (error) {
			if (error instanceof Error && error.message.startsWith('No MBFC entry found')) {
				return null;
			} else {
				throw error;
			}
		}
	}

	static async getInstance() {
		const mbfcData = existsSync(MBFCClient.cacheFilePath)
			? JSON.parse(readFileSync(MBFCClient.cacheFilePath).toString())
			: await downloadMbfcData();

		return new MBFCClient(mbfcData);
	}

	static cacheFilePath = path.join('cache', 'mbfc-data.json');
}
