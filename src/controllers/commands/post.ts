import { ApplicationCommandOptionType } from 'discord.js';
import postArticle from '../../functions/post-article/post-article';
import type { Command } from './index.js';

export default {
	data: {
		name: 'post',
		description: 'Post a new thread with the given article.',
		options: [
			{
				name: 'url',
				description: 'The URL of the article to post.',
				type: ApplicationCommandOptionType.String,
				required: true,
			},
		],
	},
	async execute(interaction, client) {
		const url = interaction.options.get('url')?.value as string | undefined;
		if (!url) {
			throw new Error('No URL provided.');
		}
		await interaction.deferReply({ ephemeral: true });
		await postArticle(url, client, true);
		await interaction.editReply('Thread posted');
	},
} satisfies Command;
