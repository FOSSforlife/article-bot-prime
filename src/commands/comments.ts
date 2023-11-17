import postFromReddit from '../tasks/reddit';
import type { Command } from './index.ts';

export default {
	data: {
		name: 'comments',
		description: 'Find Reddit threads discussing the selected article.',
	},
	async execute(interaction) {
		await postFromReddit(
			{
				subreddits: ['worldnews'],
				name: 'News',
				frequency: {
					type: 'every',
				},
				preferredDomains: ['apnews.com'],
			},
			interaction.client,
			true
		);

		await interaction.reply('Pong reddit!');
	},
} satisfies Command;
