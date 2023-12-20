import type { Command } from './index.js';

export default {
	data: {
		name: 'summarize',
		description: 'Summarize the article in the thread OP.',
	},
	async execute(interaction, client) {
		await interaction.reply('Pong!');
	},
} satisfies Command;
