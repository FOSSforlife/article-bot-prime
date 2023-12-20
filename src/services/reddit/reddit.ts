import axios from 'axios';
import { RedditChild, RedditResponseData } from './reddit-response';

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
