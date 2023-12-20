import { Client } from 'discord.js';
import Parser from 'rss-parser';
import postArticle from '../../functions/post-article';

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

export default async function postFromRSS(config: RSSConfig, client: Client) {
	if (config.frequency.type === 'every') {
		const parser = new Parser();
		const feed = await parser.parseURL(config.url);
		console.log(`Fetching ${config.name}`);

		for await (const item of feed.items) {
			// TODO: This won't work if the article's pubDate is behind UTC time
			if (!item.pubDate) {
				console.log(`No pubDate: ${item.link}`);
				return;
			}

			// For testing purposes, post the first article
			// if (item.link) {
			// 	await postArticle(item.link, client, config.name);
			// 	return;
			// }

			const articleDate = new Date(item.pubDate);
			const now = new Date();
			if (
				item.link &&
				articleDate.getHours() === now.getHours() &&
				articleDate.getDate() === now.getDate() &&
				articleDate.getMonth() === now.getMonth() &&
				articleDate.getFullYear() === now.getFullYear()
			) {
				await postArticle(item.link, client, config.name);
				console.log(item.link);
			} else {
				// console.log(`Not within the hour: ${item.link} ${item.pubDate}`);
				// console.log(new Date(item.pubDate).getHours(), new Date().getHours());
			}
		}

		feed.items.forEach((item) => {});
	} else {
		throw new Error('RSS per-day not implemented');
	}

	// if frequency is perDay, then post the top article of the day (might actually be the same logic as above)
}
