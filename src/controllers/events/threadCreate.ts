import { Events } from 'discord.js';
import type { Event } from './index';

export default {
	name: Events.ThreadCreate,
	async execute(thread, newlyCreated) {
		console.log(`Thread created: ${JSON.stringify(thread)} ${newlyCreated}`);
	},
} satisfies Event<Events.ThreadCreate>;
