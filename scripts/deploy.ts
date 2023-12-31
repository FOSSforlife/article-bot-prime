import process from 'node:process';
import { API } from '@discordjs/core';
import { REST } from 'discord.js';
import { loadCommands } from '../src/startup/loaders';
import path from 'node:path';

(async () => {
	const commands = await loadCommands(path.join(__dirname, '..', 'controllers', 'commands'));
	const commandData = [...commands.values()].map((command) => command.data);

	const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
	const api = new API(rest);

	const result = await api.applicationCommands.bulkOverwriteGlobalCommands(process.env.APPLICATION_ID!, commandData);

	console.log(`Successfully registered ${result.length} commands.`);
})();
