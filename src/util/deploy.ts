import process from 'node:process';
import { URL } from 'node:url';
import { API } from '@discordjs/core/dist/http-only';
import { REST } from 'discord.js';
import { loadCommands } from './loaders';

(async () => {
	const commands = await loadCommands(new URL('../commands/', __dirname));
	const commandData = [...commands.values()].map((command) => command.data);

	const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
	const api = new API(rest);

	const result = await api.applicationCommands.bulkOverwriteGlobalCommands(process.env.APPLICATION_ID!, commandData);

	console.log(`Successfully registered ${result.length} commands.`);
})();
