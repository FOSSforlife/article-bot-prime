import { extract } from 'article-parser';
import { getByUrl } from 'mbfc-node';
import { readFile } from 'fs/promises';
import path from 'path';
import { MBFCData, Result } from 'mbfc-node/dist/interfaces';
import { Client, ForumChannel, TextChannel } from 'discord.js';
import { articleParserMockResponse } from '../services/test-data/article-parser';
import { OpenAIClient } from '../services/openai/openai';
import { ARTICLE_FORUM_ID } from '../config';
import { DiscordClient } from '../services/discord/discord';

function getMbfcForUrl(url: string, mbfcData: MBFCData): Result | null {
	try {
		const result = getByUrl(url, mbfcData);
		return result;
	} catch (error) {
		if (error instanceof Error && error.message.startsWith('No MBFC entry found')) {
			return null;
		} else {
			throw error;
		}
	}
}

export default async function postArticle(
	urlFromFeed: string,
	discordClient: DiscordClient,
	tagName: string,
	openAiClient = new OpenAIClient()
) {
	const data = await extract(urlFromFeed);
	if (!data) {
		console.error('No data');
		return;
	}
	const { url, title, description, links, image, author, source, published, ttr, content } = data;

	console.log('Posting article');

	const mbfcData = JSON.parse((await readFile(path.join('cache', 'mbfc-data.json'))).toString());

	// Uncomment to use test data:
	// const { url, title, description, links, image, author, source, published, ttr, content } = articleParserMockResponse;

	if (!title || !url) {
		throw new Error('Invalid article data');
	}
	const mbfcResult = getMbfcForUrl(url, mbfcData);

	const article = {
		title,
		description,
		image,
		readingTimeSeconds: ttr,
		authors: author ? [author] : [],
		publisher: 'Publisher name',
		url,
		mbfcResult: mbfcResult ?? undefined,
	};
	console.log(article);

	let mbfcString = '';
	let publisher;
	if (mbfcResult) {
		const { bias, credibility, factualReporting, name, url } = mbfcResult;
		publisher = name;
		const reportingString =
			factualReporting === 'Mostly-Factual' ? 'Mostly-Factual Reporting' : `${factualReporting} Factual Reporting}`;
		mbfcString = `**Media Bias Fact Check for [${publisher}](${url}):** ${bias}, ${credibility}, ${reportingString}\n`;
	}

	let aiSummaryString = '';
	let shortAiSummaryString = '';
	if (content) {
		const articleSummary = await openAiClient.getArticleSummary(title, content, author, publisher ?? tagName);
		if (articleSummary) {
			const { summary, discussionQuestions, terms, bias } = articleSummary;
			aiSummaryString = `**Summary:** ${summary}\n\n**Discussion Questions:**\n${discussionQuestions
				.map((questionText) => `- ${questionText}`)
				.join('\n')}\n\n**Bias:**\n${bias}\n\n**Terms:**\n${terms
				.map((term) => `- ${term.term}: ${term.definition}`)
				.join('\n')}\n\n(Generated using OpenAI's GPT-3.5-Turbo)\n\n`;

			shortAiSummaryString = `**Summary:** ${summary}\n\n**Discussion Questions:**\n${discussionQuestions
				.map((questionText) => `- ${questionText}`)
				.join('\n')}\n\n(Generated using OpenAI's GPT-3.5-Turbo)\n\n`;
		}
	}

	const readingTimeString = ttr
		? `Reading time: ${Math.round(ttr / 60)} minute${Math.round(ttr / 60) === 1 ? '' : 's'}\n\n`
		: '';

	const tag = discordClient.getAvailableForumTags().find((tag) => tag.name === tagName);
	let threadContent = `${aiSummaryString}${readingTimeString}${mbfcString}${url}`;
	if (threadContent.length > 2000) {
		threadContent = `${aiSummaryString}${readingTimeString}${url}`;
	}
	if (threadContent.length > 2000) {
		threadContent = `${shortAiSummaryString}${readingTimeString}${url}`;
	}

	await discordClient.createThread(`${title}`, threadContent, tag ? [tag.id] : []);
}
