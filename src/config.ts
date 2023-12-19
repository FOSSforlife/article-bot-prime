import { RedditConfig } from './tasks/reddit';
import { RSSConfig } from './tasks/rss';

// Test channel
export const ARTICLE_FORUM_ID = '1029218031857053766';

// Production channel
// export const ARTICLE_FORUM_ID = '1020378946900074557';

export default {
	rssFeeds: [
		{
			url: 'https://www.vox.com/rss/future-perfect/index.xml',
			name: 'Future Perfect',
			frequency: {
				type: 'every',
			},
		},
		{
			url: 'https://80000hours.org/feed/',
			name: '80000 Hours',
			frequency: {
				type: 'every',
			},
		},
		{
			url: 'https://www.astralcodexten.com/feed',
			name: 'Astral Codex Ten',
			frequency: {
				type: 'every',
			},
		},
		{
			url: 'https://www.nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/by/ezra-klein/rss.xml',
			name: 'Ezra Klein',
			frequency: {
				type: 'every',
			},
		},
		{
			url: 'https://www.noahpinion.blog/feed',
			name: 'Noahpinion',
			frequency: {
				type: 'every',
			},
		},
	] as Array<RSSConfig>,
	redditFeeds: [
		{
			subreddits: ['news', 'politics', 'worldnews'],
			name: 'News',
			frequency: {
				type: 'perDay',
				hours: [12],
			},
			preferredDomains: ['apnews.com', 'reuters.com'],
		},
		{
			subreddits: ['truereddit', 'inthenews', 'foodforthought'],
			name: 'Opinion',
			frequency: {
				type: 'perDay',
				hours: [7],
			},
		},
	] as Array<RedditConfig>,
};
