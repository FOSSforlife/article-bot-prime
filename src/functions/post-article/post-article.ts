import { ArticleData, extract } from 'article-parser';
import { OpenAIClient, OpenAIClientInterface } from '../../services/openai/openai';
import { DiscordClientInterface } from '../../services/discord/discord';
import { MBFCClient, MBFCClientInterface } from '../../services/mbfc/mbfc';
import { Article } from './article';

export default async function postArticle(
	urlFromFeed: string,
	discordClient: DiscordClientInterface,
	tagName: string,
	openAiClient: OpenAIClientInterface = new OpenAIClient(),
	mbfcClient?: MBFCClientInterface,
	extractFn: (url: string) => Promise<ArticleData> = extract
) {
	if (!mbfcClient) {
		mbfcClient = await MBFCClient.getInstance();
	}

	const data = await extractFn(urlFromFeed);
	if (!data || !data.title) {
		console.error('No data');
		return;
	}

	console.log('Posting article');

	const mbfcResult = mbfcClient.getMbfcForUrl(urlFromFeed);
	const summary = data.content
		? await openAiClient.getArticleSummary(data.title, data.content, data.author, mbfcResult?.name)
		: null;
	const article = new Article(urlFromFeed, data, summary, mbfcResult);
	const tag = discordClient.getAvailableForumTags().find((tag) => tag.name === tagName);
	const postString = article.getPostString();
	if (!postString) {
		throw new Error('Failed to generate post string');
	}

	await discordClient.createThread(`${data.title}`, postString, tag ? [tag.id] : []);
}
