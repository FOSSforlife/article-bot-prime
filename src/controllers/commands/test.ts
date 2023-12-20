import type { Command } from './index.js';

export default {
	data: {
		name: 'test',
		description: 'Test',
	},
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
} satisfies Command;
