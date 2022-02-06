package io.github.PgBiel.saltdiscordbot.commands.utility;

import discord4j.common.util.Snowflake;
import discord4j.core.object.entity.Message;
import discord4j.rest.util.Permission;
import net.exploitables.slashlib.commands.MessageCommand;
import net.exploitables.slashlib.context.ChatInputInteractionContext;
import net.exploitables.slashlib.context.ChatInputInteractionContextBuilder;
import net.exploitables.slashlib.context.MessageInteractionContext;
import net.exploitables.slashlib.context.MessageInteractionContextBuilder;
import reactor.core.publisher.Mono;

public class GuildMsgCmd extends MessageCommand {
    public GuildMsgCmd() {
        super("Do thing");
//        setUsableInDMs();
//        setBotDiscordPermissions(Permission.BAN_MEMBERS);
        setUserDiscordPermissions(Permission.BAN_MEMBERS);
        restrictToGuildIDs(288362234780844032L);
    }

    @Override
    public Mono<MessageInteractionContext> executeMessage(MessageInteractionContext ctx) {
        Long guildID = ctx.getEvent().getInteraction().getGuildId().map(Snowflake::asLong).orElse(0L);
        String thisGID = getCommandGuildID(guildID).map(Snowflake::asString).orElse("[UNKNOWN]");
        Message msg = ctx.getTargetMessage();
        return ctx.getEvent()
                .reply("Hi! You said '" + msg.getContent() + "'! (Cmd Guild ID: " + thisGID + "; currently in guild " + guildID + ")")
                .withEphemeral(true)
                .thenReturn(ctx);
    }

    @Override
    public MessageInteractionContextBuilder setRequestData(MessageInteractionContextBuilder builder) {
        builder.requireMessage();
        return builder;
    }
}
