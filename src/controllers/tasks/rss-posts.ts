import Parser from 'rss-parser';
import postArticle from '../../functions/post-article/post-article';
import { DiscordClient } from '../../services/discord/discord';

// Post every article by checking each hour
interface FrequencyEvery {
	type: 'every';
}

// Post the top article of the day at the specified hours
interface FrequencyPerDay {
	type: 'perDay';
	hours: number[];
}

type Frequency = FrequencyEvery | FrequencyPerDay;

export interface RSSConfig {
	url: string;
	name: string;
	frequency: Frequency;
	aiSummaries: boolean;
}

export default async function postFromRSS(config: RSSConfig, client: DiscordClient) {
	if (config.frequency.type === 'every') {
		const parser = new Parser();
		const feed = await parser.parseURL(config.url);
		console.log(`Fetching ${config.name}`);

		for await (const item of feed.items) {
			// TODO: This won't work if the article's pubDate is behind UTC time
			if (!item.pubDate) {
				console.log(`No pubDate: ${item.link}`);
				continue;
			}

			// For testing purposes, post the first article
			// if (item.link) {
			// 	await postArticle(item.link, client, config.name);
			// 	return;
			// }

			const articleDate = new Date(item.pubDate);
			const now = new Date();
			// not working
			if (
				item.link &&
				articleDate.getUTCHours() === now.getUTCHours() - 1 &&
				articleDate.getUTCDate() === now.getUTCDate() &&
				articleDate.getUTCMonth() === now.getUTCMonth() &&
				articleDate.getUTCFullYear() === now.getUTCFullYear()
			) {
				await postArticle(item.link, client, true, config.name);
				console.log(item.link);
			} else {
				// console.log(`Not within the hour: ${item.link} ${item.pubDate}`);
				// console.log(new Date(item.pubDate).getHours(), new Date().getHours());
			}
		}

		const firstItem = feed.items[0];
		console.log(new Date(), new Date(firstItem.pubDate ?? 0));
		console.log({ firstItem });
	} else {
		throw new Error('RSS per-day not implemented');
	}

	// if frequency is perDay, then post the top article of the day (might actually be the same logic as above)
}
