package io.github.PgBiel.saltdiscordbot.commands.utility;

import discord4j.common.util.Snowflake;
import discord4j.rest.util.Permission;
import net.exploitables.slashlib.commands.TopCommand;
import net.exploitables.slashlib.commands.TopGroupCommand;
import net.exploitables.slashlib.context.ChatInputInteractionContext;
import net.exploitables.slashlib.context.ChatInputInteractionContextBuilder;
import net.exploitables.slashlib.utility.OptionBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

public class GuildPingCmd extends TopGroupCommand {
//    public Logger logger = LoggerFactory.getLogger(GuildPingCmd.class);

    public GuildPingCmd() {
        super("pingy", "Pings (guild-only).");
//        setUsableInDMs();
        setBotDiscordPermissions(Permission.BAN_MEMBERS);
//        setUserDiscordPermissions(Permission.BAN_MEMBERS);
        restrictToGuildIDs(288362234780844032L, 193903425640071168L);
//        addOption(OptionBuilder.requiredInteger("test", "lol"));
//        addOption(OptionBuilder.requiredInteger("testa", "lol2"));
//        addOption(OptionBuilder.optionalRole("testb", "lol3"));
        addSubCommand(new GuildPingSubCmd());
    }
//    @Override
//    public Mono<ChatInputInteractionContext> executeChat(ChatInputInteractionContext ctx) {
//        logger.info("Guild-Pinged by " + ctx.getEvent().getInteraction().getUser().getTag());
//        String thisGID = getCommandGuildID(
//                ctx.getEvent().getInteraction().getGuildId().map(Snowflake::asLong).orElse(0L)
//        ).map(Snowflake::asString).orElse("[UNKNOWN]");
//        return ctx.getEvent().reply("Pong! (Cmd Guild ID: " + thisGID + ". Am I global? " + isGlobal() + ")").withEphemeral(true).thenReturn(ctx);
//    }
//
//    @Override
//    public ChatInputInteractionContextBuilder setRequestData(ChatInputInteractionContextBuilder ctx) {
//        ctx.requireGuild();
//        return ctx;
//    }
}
