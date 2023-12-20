import { Client, ForumChannel, GuildForumTag } from 'discord.js';
import { Event } from '../../controllers/events';
import { ARTICLE_FORUM_ID } from '../../config';
import { sleep } from 'openai/core';

export class DiscordClient {
	private forumChannel?: ForumChannel;

	constructor(private client: Client) {}

	async init() {
		this.client.login(process.env.DISCORD_TOKEN);
		const forumChannel = await this.client.channels.fetch(ARTICLE_FORUM_ID);
		if (forumChannel && forumChannel instanceof ForumChannel) {
			this.forumChannel = forumChannel;
		} else {
			throw new Error(`Could not find forum channel ${ARTICLE_FORUM_ID}`);
		}
	}

	get checkForForumChannel() {
		if (!this.forumChannel) {
			console.error('Tried to access forum channel before initializing');
			sleep(5000);
		}
		if (!this.forumChannel) {
			throw new Error('Access forum channel retry failed. Aborting.');
		}
		return this.forumChannel;
	}

	async createThread(name: string, content: string, appliedTags: Array<string> = []) {
		this.checkForForumChannel.threads.create({
			message: {
				content,
			},
			appliedTags,
			name,
		});
	}

	getAvailableForumTags() {
		return this.checkForForumChannel.availableTags;
	}

	registerEvent(event: Event) {
		this.client[event.once ? 'once' : 'on'](event.name, async (...args) => event.execute(...args));
	}
}
