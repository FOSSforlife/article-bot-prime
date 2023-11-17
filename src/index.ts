import process from 'node:process';
import path from 'node:path';
import { Client, GatewayIntentBits } from 'discord.js';
import { loadCommands, loadEvents } from './util/loaders';
import { registerEvents } from './util/registerEvents';

(async () => {
	// Initialize the client
	const client = new Client({ intents: [GatewayIntentBits.Guilds] });

	// Load the events and commands
	const events = await loadEvents(path.join(__dirname, 'events'));
	const commands = await loadCommands(path.join(__dirname, 'commands'));

	// Register the event handlers
	registerEvents(commands, events, client);

	// Login to the client
	void client.login(process.env.DISCORD_TOKEN);
})();
