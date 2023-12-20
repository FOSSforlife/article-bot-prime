import { extract } from 'article-parser';
import { getByUrl } from 'mbfc-node';
import { readFile } from 'fs/promises';
import path from 'path';
import { MBFCData, Result } from 'mbfc-node/dist/interfaces';
import { Client, ForumChannel, TextChannel } from 'discord.js';
import { articleParserMockResponse } from '../test-data/article-parser';
import { getArticleSummary } from '../services/openai';
import { ARTICLE_FORUM_ID } from '../config';

const articleBotChannelName = '🤖-article-voting';

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

export default async function postArticle(urlFromFeed: string, client: Client) {
	// const data = await extract(urlFromFeed);
	// if (!data) {
	// 	console.error('No data');
	// 	return;
	// }
	// const { url, title, description, links, image, author, source, published, ttr, content } = data;

	// console.log('Posting article');

	// const mbfcData = JSON.parse((await readFile(path.join('cache', 'mbfc-data.json'))).toString());

	// // Uncomment to use test data:
	// // const { url, title, description, links, image, author, source, published, ttr, content } = articleParserMockResponse;

	// if (!title || !url) {
	// 	throw new Error('Invalid article data');
	// }
	// const mbfcResult = getMbfcForUrl(url, mbfcData);

	// // console.log(content);
	// const article = {
	// 	title,
	// 	description,
	// 	image,
	// 	// content,
	// 	readingTimeSeconds: ttr,
	// 	authors: author ? [author] : [],
	// 	publisher: 'Publisher name',
	// 	url,
	// 	mbfcResult: mbfcResult ?? undefined,
	// };
	// console.log(article);

	// // TODO: Article summary after the article has been posted
	// // const articleSummary = await getArticleSummary(content);
	// // console.log({ articleSummary });
	// // if (!mbfcResult) {
	// // 	return;
	// // }
	// let mbfcString = '';
	// if (mbfcResult) {
	// 	const { bias, credibility, factualReporting, name: publisher } = mbfcResult;
	// 	mbfcString = `**Info about ${publisher}:**\nBias: ${bias}\nCredibility ${credibility}\nFactual Reporting: ${factualReporting}`;
	// }

	// const channel = (await client.channels.fetch(ARTICLE_FORUM_ID)) as ForumChannel;
	// console.log(`Posting in ${channel.name}`);
	// try {
	// 	console.log(channel.threads.create);
	// 	await channel.threads.create({
	// 		message: {
	// 			content: `**${title}**\n${url}\n${mbfcString}`,
	// 		},
	// 		name: `${title}`,
	// 	});
	// } catch (error) {
	// 	console.error(error);
	// }

	const channel = (await client.channels.fetch(ARTICLE_FORUM_ID)) as ForumChannel;
	await channel.threads.create({
		message: {
			content: `Example content`,
		},
		name: `Example title`,
	});
}
