import { scheduleJob } from 'node-schedule';
import config from '../config';
import postFromRSS from '../controllers/tasks/rss-posts';
import postFromReddit from '../controllers/tasks/reddit-posts';
import { Client } from 'discord.js';
import { DiscordClient } from '../services/discord/discord';

function scheduleJobAtHour(hour: number, fn: () => void) {
	scheduleJob(`0 ${hour} * * *`, fn);
}

function scheduleJobEveryHour(fn: () => void) {
	scheduleJob('0 * * * *', fn);
}

function scheduleJobEveryMinute(fn: () => void) {
	scheduleJob('* * * * *', fn);
}

function startRSSJobs(client: DiscordClient) {
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

function startRedditJobs(client: DiscordClient) {
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

export function startScheduler(client: DiscordClient) {
	startRSSJobs(client);
	startRedditJobs(client);
}
