import process from 'node:process';
import path from 'node:path';
import { Client, GatewayIntentBits } from 'discord.js';
import { loadCommands, loadEvents } from './startup/loaders';
import { registerEvents } from './startup/registerEvents';
import axios from 'axios';
import { mkdirpSync } from 'fs-extra';
import { writeFileSync } from 'node:fs';
import { startScheduler } from './startup/startScheduler';
import { DiscordClient } from './services/discord/discord';

(async () => {
	function downloadMbfcData() {
		axios.get('https://raw.githubusercontent.com/drmikecrowe/mbfcext/main/docs/v3/combined.json').then((res) => {
			if (!res.data || 'version' in res.data === false || 'date' in res.data === false) {
				console.error('Could not retrieve MBFC data');
			}
			mkdirpSync('cache');
			writeFileSync(path.join('cache', 'mbfc-data.json'), JSON.stringify(res.data));
		});
	}

	// Initialize the client
	const client = new DiscordClient(new Client({ intents: [GatewayIntentBits.Guilds] }));

	// Load the events and commands
	const events = await loadEvents(path.join(__dirname, 'controllers', 'events'));
	const commands = await loadCommands(path.join(__dirname, 'controllers', 'commands'));

	// Register the event handlers
	registerEvents(commands, events, client);
	startScheduler(client);

	// Login to the client
	void client.init();
	downloadMbfcData();
})();
