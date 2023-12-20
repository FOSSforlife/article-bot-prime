import { Events } from 'discord.js';
import type { Command } from '../controllers/commands/index.js';
import type { Event } from '../controllers/events/index.js';
import { DiscordClient } from '../services/discord/discord.js';

export function registerEvents(commands: Map<string, Command>, events: Event[], client: DiscordClient): void {
	// Create an event to handle command interactions
	const interactionCreateEvent: Event<Events.InteractionCreate> = {
		name: Events.InteractionCreate,
		async execute(interaction) {
			if (interaction.isCommand()) {
				const command = commands.get(interaction.commandName);

				if (!command) {
					throw new Error(`Command '${interaction.commandName}' not found.`);
				}

				await command.execute(interaction, client);
			}
		},
	};

	for (const event of [...events, interactionCreateEvent]) {
		client.registerEvent(event);
	}
}
