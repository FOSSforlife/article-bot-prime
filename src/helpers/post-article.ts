import { extract } from 'article-parser';
import { getByUrl } from 'mbfc-node';
import { readFile } from 'fs/promises';
import path from 'path';
import { MBFCData, Result } from 'mbfc-node/dist/interfaces';
import { Client, ForumChannel, TextChannel } from 'discord.js';
import { articleParserMockResponse } from '../test-data/article-parser';
import { getArticleSummary } from '../services/openai';
import { ARTICLE_FORUM_ID } from '../config';

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

export default async function postArticle(urlFromFeed: string, client: Client, tagName: string) {
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

	// console.log(content);
	const article = {
		title,
		description,
		image,
		// content,
		readingTimeSeconds: ttr,
		authors: author ? [author] : [],
		publisher: 'Publisher name',
		url,
		mbfcResult: mbfcResult ?? undefined,
	};
	console.log(article);
	const wordCount = content?.split(' ').length ?? 0;

	let mbfcString = '';
	let publisher;
	if (mbfcResult) {
		const { bias, credibility, factualReporting, name } = mbfcResult;
		publisher = name;
		mbfcString = `**Media Bias Fact Check for ${publisher}:**\nBias: ${bias}\nCredibility ${credibility}\nFactual Reporting: ${factualReporting}`;
	}

	let aiSummaryString = '';
	if (content) {
		const articleSummary = await getArticleSummary(title, content, author, publisher ?? tagName);
		if (articleSummary) {
			const { summary, discussionQuestions, bias } = articleSummary;
			aiSummaryString = `**Summary:** ${summary}\n\n**Discussion Questions:**\n${discussionQuestions
				.map((questionText) => `- ${questionText}`)
				.join('\n')}\n\n**Bias:**\n${bias}\n\n(Generated using OpenAI's GPT-3.5-Turbo)`;
		}
	}

	const channel = (await client.channels.fetch(ARTICLE_FORUM_ID)) as ForumChannel;
	const tag = channel.availableTags.find((tag) => tag.name === tagName);
	await channel.threads.create({
		message: {
			content: `${aiSummaryString}\n\nWord count: ${wordCount}\n\n${mbfcString}\n${url}`,
		},
		appliedTags: tag ? [tag.id] : [],
		name: `${title}`,
	});
}
