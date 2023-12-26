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
	// Initialize the client
	const client = await DiscordClient.createInstance();

	// Load the events and commands
	const events = await loadEvents(path.join(__dirname, 'controllers', 'events'));
	const commands = await loadCommands(path.join(__dirname, 'controllers', 'commands'));

	// Register the event handlers
	registerEvents(commands, events, client);
	startScheduler(client);

	// Login to the client
	void client.init();
})();
