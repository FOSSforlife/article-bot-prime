import { Client } from 'discord.js';

// Post every article by checking each hour
interface FrequencyEvery {
	type: 'every';
}

// Post the top article of the day at the specified hours
interface FrequencyPerDay {
	type: 'perDay';
	hours: number[];
}

type Frequency = FrequencyEvery | FrequencyPerDay;

export interface RSSConfig {
	url: string;
	name: string;
	frequency: Frequency;
}

export default function postFromRSS(config: RSSConfig, client: Client) {
	console.log('Hello, world!');
	// if frequency is every, then only post what hasn't already been posted

	// if frequency is perDay, then post the top article of the day (might actually be the same logic as above)
}
