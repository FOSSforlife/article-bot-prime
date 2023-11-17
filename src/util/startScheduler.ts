import { scheduleJob } from 'node-schedule';
import config from '../config';
import postFromRSS from '../tasks/rss';
import postFromReddit from '../tasks/reddit';

function scheduleJobAtHour(hour: number, fn: () => void) {
	scheduleJob(`0 0 ${hour} * * *`, fn);
}

function startRSSJobs() {
	for (const rssFeed of config.rssFeeds) {
		if (rssFeed.frequency.type === 'every') {
			scheduleJob('0 0 * * * *', () => postFromRSS(rssFeed));
		} else {
			for (const hour of rssFeed.frequency.hours) {
				scheduleJobAtHour(hour, () => postFromRSS(rssFeed));
			}
		}
	}
}

function startRedditJobs() {
	for (const redditFeed of config.redditFeeds) {
		if (redditFeed.frequency.type === 'every') {
			scheduleJob('0 0 * * * *', () => postFromReddit(redditFeed));
		} else {
			for (const hour of redditFeed.frequency.hours) {
				scheduleJobAtHour(hour, () => postFromReddit(redditFeed));
			}
		}
	}
}

export function startScheduler() {
	scheduleJob('0 0 0 * * *', () => {});
}
