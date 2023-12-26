import { RedditConfig } from './controllers/tasks/reddit-posts';
import { RSSConfig } from './controllers/tasks/rss-posts';

// Test channel
export const ARTICLE_FORUM_ID = '1029218031857053766';

// Production channel
// export const ARTICLE_FORUM_ID = '1020378946900074557';

export default {
	rssFeeds: [
		{
			url: 'https://www.vox.com/rss/index.xml',
			name: 'Vox',
			frequency: {
				type: 'every',
			},
			aiSummaries: true,
		},
		{
			url: 'https://www.vox.com/rss/future-perfect/index.xml',
			name: 'Future Perfect',
			frequency: {
				type: 'every',
			},
			aiSummaries: true,
		},
		{
			url: 'https://80000hours.org/feed/',
			name: '80,000 Hours',
			frequency: {
				type: 'every',
			},
			aiSummaries: false,
		},
		{
			url: 'https://www.astralcodexten.com/feed',
			name: 'Astral Codex Ten',
			frequency: {
				type: 'every',
			},
			aiSummaries: true,
		},
		{
			url: 'https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/by/ezra-klein/rss.xml',
			name: 'Ezra Klein',
			frequency: {
				type: 'every',
			},
			aiSummaries: true,
		},
		{
			url: 'https://www.noahpinion.blog/feed',
			name: 'Noahpinion',
			frequency: {
				type: 'every',
			},
			aiSummaries: true,
		},
	] as Array<RSSConfig>,
	redditFeeds: [
		{
			subreddits: ['news', 'politics', 'worldnews'],
			name: 'News',
			frequency: {
				type: 'perDay',
				hours: [7, 12],
				// hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
			},
			preferredDomains: ['apnews.com', 'reuters.com'],
		},
		{
			subreddits: ['truereddit', 'inthenews', 'foodforthought'],
			name: 'Opinion',
			frequency: {
				type: 'perDay',
				hours: [7],
				// hours: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
			},
		},
	] as Array<RedditConfig>,
};
