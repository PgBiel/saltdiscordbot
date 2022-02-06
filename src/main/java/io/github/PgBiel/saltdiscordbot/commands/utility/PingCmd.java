package io.github.PgBiel.saltdiscordbot.commands.utility;

import discord4j.rest.util.Permission;
import io.github.PgBiel.saltdiscordbot.SaltBot;
import net.exploitables.slashlib.commands.TopCommand;
import net.exploitables.slashlib.context.ChatInputInteractionContext;
import net.exploitables.slashlib.context.ChatInputInteractionContextBuilder;
import reactor.core.publisher.Mono;

public class PingCmd extends TopCommand {
    public PingCmd() {
        super("ping", "Pings.");
//        setUsableInDMs();
        setBotDiscordPermissions(Permission.BAN_MEMBERS);
//        setUserDiscordPermissions(Permission.BAN_MEMBERS);
    }
    @Override
    public Mono<ChatInputInteractionContext> executeChat(ChatInputInteractionContext ctx) {
//        SaltBot.LOGGER.info("Pinged by " + ctx.getEvent().getInteraction().getUser().getTag());
        return ctx.getEvent()
                .reply("Pong! (My Global ID is " + getCommandGlobalID() + ". Am I global? " + isGlobal() + ")")
                .withEphemeral(true)
                .thenReturn(ctx);
    }

    @Override
    public ChatInputInteractionContextBuilder setRequestData(ChatInputInteractionContextBuilder ctx) {
        return ctx;
    }
}
