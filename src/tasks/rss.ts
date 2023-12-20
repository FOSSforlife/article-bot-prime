import { Client } from 'discord.js';
import Parser from 'rss-parser';
import postArticle from '../helpers/post-article';

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
}

export default async function postFromRSS(config: RSSConfig, client: Client) {
	if (config.frequency.type === 'every') {
		const parser = new Parser();
		const feed = await parser.parseURL(config.url);
		console.log(feed.title);

		feed.items.forEach((item) => {
			// TODO: This won't work if the article's pubDate is behind UTC time
			if (item.link && item.pubDate && new Date(item.pubDate).getHours() === new Date().getHours()) {
				postArticle(item.link, client);
				console.log(item.link);
			} else {
				console.log(`Not within the hour: ${item.link} ${item.pubDate}`);
				console.log(
					item.pubDate ? new Date(item.pubDate).getHours() : "Can't get article pubdate",
					new Date().getHours()
				);
			}
		});
	} else {
		throw new Error('RSS per-day not implemented');
	}

	// if frequency is perDay, then post the top article of the day (might actually be the same logic as above)
}
