import postFromReddit from '../tasks/reddit-posts';
import type { Command } from '.';

export default {
	data: {
		name: 'comments',
		description: 'Find Reddit threads discussing the selected article.',
	},
	async execute(interaction, client) {
		await postFromReddit(
			{
				subreddits: ['worldnews'],
				name: 'News',
				frequency: {
					type: 'every',
				},
				preferredDomains: ['apnews.com'],
			},
			client
		);

		await interaction.reply('Pong reddit!');
	},
} satisfies Command;
