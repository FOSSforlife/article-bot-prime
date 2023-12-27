import { ArticleData, extract } from 'article-parser';
import { OpenAIClient, OpenAIClientInterface } from '../../services/openai/openai';
import { DiscordClientInterface } from '../../services/discord/discord';
import { MBFCClient, MBFCClientInterface } from '../../services/mbfc/mbfc';
import { Article } from './article';

export default async function postArticle(
	urlFromFeed: string,
	discordClient: DiscordClientInterface,
	createThread: boolean = true,
	tagName?: string,
	includeUrl: boolean = true,
	openAiClient: OpenAIClientInterface = new OpenAIClient(),
	mbfcClient?: MBFCClientInterface,
	extractFn: (url: string) => Promise<ArticleData> = extract,
	articleClass: typeof Article = Article
): Promise<string> {
	if (!mbfcClient) {
		mbfcClient = await MBFCClient.getInstance();
	}

	const data = await extractFn(urlFromFeed);
	if (!data || !data.title) {
		throw new Error('No article data');
	}

	console.log('Posting article');

	const mbfcResult = mbfcClient.getMbfcForUrl(urlFromFeed);
	const summary = data.content
		? await openAiClient.getArticleSummary(data.title, data.content, data.author, mbfcResult?.name)
		: null;
	const article = new articleClass(urlFromFeed, data, summary, mbfcResult, includeUrl);
	const tag = tagName ? discordClient.getAvailableForumTags().find((tag) => tag.name === tagName) : undefined;
	const postString = article.getPostString();
	if (!postString) {
		throw new Error('Failed to generate post string');
	}

	if (createThread) {
		await discordClient.createThread(`${data.title}`, postString, tag ? [tag.id] : []);
	}
	return postString;
}
