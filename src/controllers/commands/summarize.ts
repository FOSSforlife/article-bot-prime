import { ApplicationCommandOptionType } from 'discord.js';
import postArticle from '../../functions/post-article/post-article';
import type { Command } from './index.js';

export default {
	data: {
		name: 'summarize',
		description: 'Summarize the given article using AI.',
		options: [
			{
				name: 'url',
				description: 'The URL of the article to summarize.',
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
		await interaction.deferReply();
		const postString = await postArticle(url, client, false, undefined, false);
		await interaction.editReply(postString);
	},
} satisfies Command;
