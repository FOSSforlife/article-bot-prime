import { ArticleData, extract } from 'article-parser';
import { getByUrl } from 'mbfc-node';
import { readFile } from 'fs/promises';
import path from 'path';
import { MBFCData, Result } from 'mbfc-node/dist/interfaces';
import { Client, ForumChannel, TextChannel } from 'discord.js';
import { articleParserMockResponse } from '../services/test-data/article-parser';
import { ArticleSummaryResponse, OpenAIClient, OpenAIClientInterface } from '../services/openai/openai';
import { ARTICLE_FORUM_ID } from '../config';
import { DiscordClient, DiscordClientInterface } from '../services/discord/discord';

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

const concat = (...args: string[]) => args.join('');
const section = (header: string, content: string) => `**${header}**\n${content}\n\n`;

class Article {
	constructor(
		private articleData: ArticleData,
		private articleSummary: ArticleSummaryResponse,
		private mediaBias?: Result
	) {}

	private getAISummaryString() {
		if (!this.articleSummary) {
			return '';
		}
		const { summary, discussionQuestions, terms, bias } = this.articleSummary;
		const aiSummaryString = concat(
			section('Summary', summary),
			section('Discussion Questions', discussionQuestions.map((questionText) => `- ${questionText}`).join('\n')),
			section('Bias', bias),
			section('Terms', terms.map((term) => `- ${term.term}: ${term.definition}`).join('\n')),
			"(Generated using OpenAI's GPT-3.5-Turbo)\n\n"
		);

		return aiSummaryString;
	}

	private getShortAISummaryString() {
		if (!this.articleSummary) {
			return '';
		}
		const { summary, discussionQuestions } = this.articleSummary;
		const aiSummaryString = concat(
			section('Summary', summary),
			section('Discussion Questions', discussionQuestions.map((questionText) => `- ${questionText}`).join('\n')),
			"(Generated using OpenAI's GPT-3.5-Turbo)\n\n"
		);

		return aiSummaryString;
	}

	private getReadingTimeString() {
		if (!this.articleData) {
			return '';
		}
		const { ttr } = this.articleData;
		return ttr ? `Reading time: ${Math.round(ttr / 60)} minute${Math.round(ttr / 60) === 1 ? '' : 's'}\n\n` : '';
	}

	private getMbfcString() {
		if (!this.mediaBias) {
			return '';
		}
		const { bias, credibility, factualReporting, name, url } = this.mediaBias;
		const publisher = name;
		const reportingString =
			factualReporting === 'Mostly-Factual' ? 'Mostly-Factual Reporting' : `${factualReporting} Factual Reporting}`;
		const mbfcString = concat(
			section(`Media Bias Fact Check for [${publisher}](${url})`, `${bias}, ${credibility}, ${reportingString}`)
		);

		return mbfcString;
	}

	get content() {
		if (!this.articleData) {
			throw new Error('Article data not fetched');
		}
		return this.articleData.content;
	}

	async getPostString() {
		const aiSummaryString = this.getAISummaryString();
		const shortAiSummaryString = this.getShortAISummaryString();
		const readingTimeString = this.getReadingTimeString();

		const potentialResponses = [
			concat(aiSummaryString, readingTimeString, this.url),
			concat(shortAiSummaryString, readingTimeString, this.url),
			concat(shortAiSummaryString, this.url),
		];
		for (const response of potentialResponses) {
			if (response.length < 2000) {
				return response;
			}
		}
	}
}

export default async function postArticle(
	urlFromFeed: string,
	discordClient: DiscordClientInterface,
	tagName: string,
	openAiClient: OpenAIClientInterface = new OpenAIClient()
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
