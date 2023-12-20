import { Events } from 'discord.js';
import type { Event } from './index';

export default {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.member?.user.bot) {
			console.log('Bot message');
		}
		console.log('Message posted', message.content);
	},
} satisfies Event<Events.MessageCreate>;
