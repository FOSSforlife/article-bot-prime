import { Client, ForumChannel, GatewayIntentBits, GuildForumTag } from 'discord.js';
import { Event } from '../../controllers/events';
import { ARTICLE_FORUM_ID } from '../../config';

export interface DiscordClientInterface {
	init(): void;
	createThread(name: string, content: string, appliedTags?: Array<string>): Promise<void>;
	getAvailableForumTags(): Array<GuildForumTag>;
	registerEvent(event: Event): void;
}

export class DiscordClient implements DiscordClientInterface {
	constructor(private client: Client, private forumChannel: ForumChannel) {}

	async init() {
		this.client.login(process.env.DISCORD_TOKEN);
		const forumChannel = await this.client.channels.fetch(ARTICLE_FORUM_ID);
		if (forumChannel && forumChannel instanceof ForumChannel) {
			this.forumChannel = forumChannel;
		} else {
			throw new Error(`Could not find forum channel ${ARTICLE_FORUM_ID}`);
		}
	}

	static async getForumChannel(client: Client) {
		const forumChannel = await client.channels.fetch(ARTICLE_FORUM_ID);
		if (forumChannel && forumChannel instanceof ForumChannel) {
			return forumChannel;
		} else {
			throw new Error(`Could not find forum channel ${ARTICLE_FORUM_ID}`);
		}
	}

	async createThread(name: string, content: string, appliedTags: Array<string> = []) {
		this.forumChannel.threads.create({
			message: {
				content,
			},
			appliedTags,
			name,
		});
	}

	getAvailableForumTags() {
		return this.forumChannel.availableTags;
	}

	registerEvent(event: Event) {
		this.client[event.once ? 'once' : 'on'](event.name, async (...args) => event.execute(...args));
	}

	static async createInstance() {
		const client = new Client({ intents: [GatewayIntentBits.Guilds] });
		await client.login(process.env.DISCORD_TOKEN);
		// await sleep(5000);
		const forumChannel = await DiscordClient.getForumChannel(client);
		const discordClient = new DiscordClient(client, forumChannel);
		await discordClient.init();
		console.log('Discord client initialized');
		return discordClient;
	}
}
