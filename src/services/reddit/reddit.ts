import axios from 'axios';
import { RedditChild } from './interfaces/reddit-response';
import redditTestData from '../../services/test-data/reddit.json';

export interface RedditClientInterface {
	getPosts(subreddits: Array<string>): Promise<Array<RedditChild>>;
}

export class RedditClient implements RedditClientInterface {
	public async getPosts(subreddits: Array<string>) {
		const response = await axios.get(`https://www.reddit.com/r/${subreddits.join('+')}/top.json?t=day`);
		const posts = response.data.data.children;
		return posts;
	}
}

export class MockRedditClient implements RedditClientInterface {
	public async getPosts(_subreddits: Array<string>) {
		const response = redditTestData;
		const posts = response.data.children as Array<RedditChild>;
		return posts;
	}
}
