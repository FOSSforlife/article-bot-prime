import OpenAI from 'openai';

const openai = new OpenAI({});

export async function getArticleSummary(title: string, content: string, author?: string, publisher?: string) {
	const authorString = author ? `${author} - ` : '';
	const publisherString = publisher ? ` (${publisher})` : '';
	const chatCompletion = await openai.chat.completions.create({
		messages: [
			{
				role: 'system',
				content:
					'You will be given an article. Give me a two to three sentence summary, a list of discussion questions about the article, and a sentence describing potential political biases of the author. These biases must be related to the article topic, but they could either come from the article itself or from information you know about the author or publisher. Answer in json format with the keys: summary, discussionQuestions, bias',
			},
			{
				role: 'user',
				content: `Title: ${title}\nAuthor: ${authorString}${publisherString}\n\n${content}`,
			},
		],
		model: 'gpt-3.5-turbo-1106',
		response_format: { type: 'json_object' },
	});

	return chatCompletion.choices[0].message.content;
}
