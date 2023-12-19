import { scheduleJob } from 'node-schedule';
import config from '../config';
import postFromRSS from '../tasks/rss';
import postFromReddit from '../tasks/reddit';
import { Client } from 'discord.js';

function scheduleJobAtHour(hour: number, fn: () => void) {
	scheduleJob(`0 ${hour} * * *`, fn);
}

function scheduleJobEveryHour(fn: () => void) {
	scheduleJob('0 * * * *', fn);
}

function startRSSJobs(client: Client) {
	for (const rssFeed of config.rssFeeds) {
		if (rssFeed.frequency.type === 'every') {
			scheduleJobEveryHour(() => postFromRSS(rssFeed, client));
		} else {
			for (const hour of rssFeed.frequency.hours) {
				scheduleJobAtHour(hour, () => postFromRSS(rssFeed, client));
			}
		}
	}
}

function startRedditJobs(client: Client) {
	for (const redditFeed of config.redditFeeds) {
		if (redditFeed.frequency.type === 'every') {
			scheduleJobEveryHour(() => postFromReddit(redditFeed, client));
		} else {
			for (const hour of redditFeed.frequency.hours) {
				scheduleJobAtHour(hour, () => postFromReddit(redditFeed, client));
			}
		}
	}
}

export function startScheduler(client: Client) {
	startRSSJobs(client);
	startRedditJobs(client);
}
