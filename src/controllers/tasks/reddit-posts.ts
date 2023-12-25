import axios from 'axios';
import redditTestData from '../../services/test-data/reddit.json';
import { articleParserMockResponse } from '../../services/test-data/article-parser';
import { Client } from 'discord.js';
import postArticle from '../../functions/post-article';
import { RedditClient, RedditClientInterface } from '../../services/reddit/reddit';
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

export interface RedditConfig {
	subreddits: Array<string>;
	frequency: Frequency;
	name: string;
	preferredDomains?: Array<string>;
}

// TODO: Search past posts to make sure the article hasn't been posted already
export default async function postFromReddit(
	config: RedditConfig,
	client: DiscordClient,
	redditClient: RedditClientInterface = new RedditClient()
) {
	const posts = await redditClient.getPosts(config.subreddits);
	const preferredPosts = posts.filter((post: any) => (config.preferredDomains ?? []).includes(post.data.domain));
	if (preferredPosts.length > 0) {
		const { permalink, url, link_flair_text, title } = preferredPosts[0].data;
		console.log({ permalink, url, link_flair_text, title });
		await postArticle(url, client, config.name);
	} else {
		console.log('No preferred post');
		const { permalink, url, link_flair_text, title } = posts[0].data;
		console.log({ permalink, url, link_flair_text, title });
	}
}
