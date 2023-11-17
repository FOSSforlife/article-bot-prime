import axios from 'axios';
import redditTestData from '../test-data/reddit.json';
import { articleParserMockResponse } from '../test-data/article-parser';
import { Client } from 'discord.js';
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

export interface RedditConfig {
	subreddits: Array<string>;
	frequency: Frequency;
	name: string;
	preferredDomains?: Array<string>;
}

// TODO: Search past posts to make sure the article hasn't been posted already
export default async function postFromReddit(config: RedditConfig, client: Client, useTestData = false) {
	// console.log('Hello, world!');

	// if (useTestData) {
	// 	const data = redditTestData;
	// 	const { url, title, description, links, image, author, source, published, ttr, content } =
	// 		articleParserMockResponse;

	// 	return;
	// }

	const response = await axios.get(`https://www.reddit.com/r/${config.subreddits.join('+')}/top.json?t=day`);
	console.log(JSON.stringify(response.data));
	const posts = response.data.data.children;
	const preferredPosts = posts.filter((post: any) => (config.preferredDomains ?? []).includes(post.data.domain));
	if (preferredPosts.length > 0) {
		const { permalink, url, link_flair_text, title } = preferredPosts[0].data;
		console.log({ permalink, url, link_flair_text, title });
		await postArticle(url, client);
	} else {
		console.log('No preferred post');
		const { permalink, url, link_flair_text, title } = posts[0].data;
		console.log({ permalink, url, link_flair_text, title });
	}
}
