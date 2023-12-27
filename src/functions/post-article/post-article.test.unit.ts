import postArticle from './post-article';

describe('post-article', () => {
	const mockDiscordClient = {
		createThread: jest.fn(),
		getAvailableForumTags: () => [
			{ id: 'tag', name: 'tag', moderated: false, restricted: false, emoji: { id: 'emoji', name: 'emoji' } },
		],
		init: jest.fn(),
		registerEvent: jest.fn(),
	};
	const mockOpenAiClient = {
		getArticleSummary: jest.fn(),
	};
	const mockMbfcClient = {
		getMbfcForUrl: jest.fn(),
	};
	const mockExtractFn = jest.fn();
	const mockArticleClass = jest.fn();
	const mockArticle = {
		getPostString: jest.fn(() => 'post string'),
	};

	mockArticleClass.mockImplementation(() => mockArticle);
	mockExtractFn.mockResolvedValue({
		title: 'title',
		content: 'content',
	});
	mockMbfcClient.getMbfcForUrl.mockReturnValue({
		name: 'name',
	});
	mockOpenAiClient.getArticleSummary.mockResolvedValue('summary');

	it('should post the article', async () => {
		const postString = await postArticle(
			'url',
			mockDiscordClient,
			true,
			'tag',
			true,
			mockOpenAiClient,
			mockMbfcClient,
			mockExtractFn,
			mockArticleClass
		);

		expect(postString).toEqual('post string');
		expect(mockDiscordClient.createThread).toHaveBeenCalledWith('title', 'post string', ['tag']);
		expect(mockArticleClass).toHaveBeenCalledWith(
			'url',
			{
				title: 'title',
				content: 'content',
			},
			'summary',
			{
				name: 'name',
			},
			true
		);
		expect(mockArticle.getPostString).toHaveBeenCalled();
	});
});
