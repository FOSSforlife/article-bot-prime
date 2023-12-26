import { ArticleData } from 'article-parser';
import { Result } from 'mbfc-node/dist/interfaces';
import { ArticleSummaryResponse } from '../../services/openai/openai';

const concat = (...args: string[]) => args.join('');
const section = (header: string, content: string) => `**${header}**\n${content}\n\n`;

export class Article {
	constructor(
		private url: string,
		private articleData: ArticleData,
		private articleSummary: ArticleSummaryResponse | null,
		private mediaBias: Result | null
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

	getPostString() {
		const aiSummaryString = this.getAISummaryString();
		const shortAiSummaryString = this.getShortAISummaryString();
		const readingTimeString = this.getReadingTimeString();
		const mbfcString = this.getMbfcString();

		const potentialResponses = [
			concat(aiSummaryString, readingTimeString, mbfcString, this.url),
			concat(aiSummaryString, readingTimeString, this.url),
			concat(aiSummaryString, this.url),
			concat(shortAiSummaryString, readingTimeString, mbfcString, this.url),
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
