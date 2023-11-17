import process from 'node:process';
import { URL } from 'node:url';
import { Client, GatewayIntentBits } from 'discord.js';
import { loadCommands, loadEvents } from './util/loaders';
import { registerEvents } from './util/registerEvents';

(async () => {
	// Initialize the client
	const client = new Client({ intents: [GatewayIntentBits.Guilds] });

	// Load the events and commands
	const events = await loadEvents(new URL('events/', __dirname));
	const commands = await loadCommands(new URL('commands/', __dirname));

	// Register the event handlers
	registerEvents(commands, events, client);

	// Login to the client
	void client.login(process.env.DISCORD_TOKEN);
})();
