import { Article } from './article';

describe('Article', () => {
	const mockArticleData = {
		title: 'title',
		content: 'content',
		ttr: 100,
	};
	const mockArticleSummary = {
		summary: 'summary',
		discussionQuestions: ['question'],
		terms: [
			{
				term: 'term',
				definition: 'definition',
			},
		],
		bias: 'bias',
	};
	const mockMediaBias = {
		bias: 'bias',
		credibility: 'credibility',
		factualReporting: 'factualReporting',
		name: 'name',
		url: 'url',
	};
	const mockIncludeUrl = true;
	const mockArticle = new Article('url', mockArticleData, mockArticleSummary, mockMediaBias, mockIncludeUrl);

	it('should return the article content', () => {
		expect(mockArticle.content).toEqual('content');
	});

	it('should return the article post string', () => {
		expect(mockArticle.getPostString()).toEqual(
			"title\n\nReading time: 2 minutes\n\n**Summary**\nsummary\n\n**Discussion Questions**\n- question\n\n**Bias**\nbias\n\n**Terms**\n- term: definition\n\n(Generated using OpenAI's GPT-3.5-Turbo)\n\n"
		);
	});

	it('should return the article post string without url', () => {
		const mockArticle = new Article('url', mockArticleData, mockArticleSummary, mockMediaBias, false);
		expect(mockArticle.getPostString()).toEqual(
			"title\n\nReading time: 2 minutes\n\n**Summary**\nsummary\n\n**Discussion Questions**\n- question\n\n**Bias**\nbias\n\n**Terms**\n- term: definition\n\n(Generated using OpenAI's GPT-3.5-Turbo)\n\n"
		);
	});

	it('should return the article post string without summary', () => {
		const mockArticle = new Article('url', mockArticleData, null, mockMediaBias, mockIncludeUrl);
		expect(mockArticle.getPostString()).toEqual(
			"title\n\nReading time: 2 minutes\n\n**Bias**\nbias\n\n(Generated using OpenAI's GPT-3.5-Turbo)\n\n"
		);
	});

	it('should return the article post string without bias', () => {
		const mockArticle = new Article('url', mockArticleData, mockArticleSummary, null, mockIncludeUrl);
		expect(mockArticle.getPostString()).toEqual(
			"title\n\nReading time: 2 minutes\n\n**Summary**\nsummary\n\n**Discussion Questions**\n- question\n\n**Terms**\n- term: definition\n\n(Generated using OpenAI's GPT-3.5-Turbo)\n\n"
		);
	});

	it('should return the article post string without summary or bias', () => {
		const mockArticle = new Article('url', mockArticleData, null, null, mockIncludeUrl);
		expect(mockArticle.getPostString()).toEqual(
			"title\n\nReading time: 2 minutes\n\n(Generated using OpenAI's GPT-3.5-Turbo)\n\n"
		);
	});

	it('should return the article post string without summary or bias or url', () => {
		const mockArticle = new Article('url', mockArticleData, null, null, false);
		expect(mockArticle.getPostString()).toEqual(
			"title\n\nReading time: 2 minutes\n\n(Generated using OpenAI's GPT-3.5-Turbo)\n\n"
		);
	});

	it('should return the article post string without summary or bias or url or ttr', () => {
		const mockArticle = new Article('url', { title: 'title', content: 'content' }, null, null, false);
		expect(mockArticle.getPostString()).toEqual("title\n\n(Generated using OpenAI's GPT-3.5-Turbo)\n\n");
	});

	it('should return the article post string without summary or bias or url or ttr or content', () => {
		const mockArticle = new Article('url', { title: 'title' }, null, null, false);
		expect(mockArticle.getPostString()).toEqual("title\n\n(Generated using OpenAI's GPT-3.5-Turbo)\n\n");
	});

	it('should return the article post string without summary or bias or url or ttr or content or title', () => {
		const mockArticle = new Article('url', {}, null, null, false);
		expect(mockArticle.getPostString()).toEqual("(Generated using OpenAI's GPT-3.5-Turbo)\n\n");
	});

	it('should return the article post string without summary or bias or url or ttr or content or title or article data', () => {
		const mockArticle = new Article('url', mockArticleData, null, null, false);
		expect(mockArticle.getPostString()).toEqual("(Generated using OpenAI's GPT-3.5-Turbo)\n\n");
	});
});
