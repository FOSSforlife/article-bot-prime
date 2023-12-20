import OpenAI from 'openai';

const openai = new OpenAI({});

export async function getArticleSummary(content: string) {
	const chatCompletion = await openai.chat.completions.create({
		messages: [{ role: 'user', content: `Summarize the following article:\n\n${content}` }],
		model: 'gpt-3.5-turbo',
	});

	console.log('hi');
	return chatCompletion.choices[0].message.content;
}
