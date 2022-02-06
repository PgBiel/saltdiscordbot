package io.github.PgBiel.saltdiscordbot.commands.utility;

import discord4j.core.object.Embed;
import discord4j.core.object.command.ApplicationCommandInteractionOption;
import discord4j.core.object.entity.User;
import discord4j.core.spec.EmbedCreateSpec;
import discord4j.discordjson.json.ApplicationCommandOptionData;
import discord4j.rest.util.AllowedMentions;
import net.exploitables.slashlib.commands.TopCommand;
import net.exploitables.slashlib.context.ChatInputInteractionContext;
import net.exploitables.slashlib.context.ChatInputInteractionContextBuilder;
import net.exploitables.slashlib.utility.OptionBuilder;
import net.exploitables.slashlib.utility.OptionsList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class EchoCmd extends TopCommand {
    private final static Logger logger = LoggerFactory.getLogger(EchoCmd.class);
    public EchoCmd() {
        super("echo", "echo a message back to you");
        this.addOption(OptionBuilder.requiredString("content", "echos this content back as a response"));
        this.addOption(OptionBuilder.optionalBoolean("private", "reply with a message only you can see"));
        restrictToGuildIDs(288362234780844032L);
    }

    @Override
    public Mono<ChatInputInteractionContext> executeChat(ChatInputInteractionContext context) {
        EchoOptions options = new EchoOptions(context.getOptions());
        User author = context.getEvent().getInteraction().getUser();
        List<ApplicationCommandOptionData> otherOptions = Optional.ofNullable(new PingCmd().getOptions()).orElse(new ArrayList<>());
        List<ApplicationCommandOptionData> evenMoreOptions = Optional.ofNullable(new GuildPingCmd().getOptions()).orElse(new ArrayList<>());
        List<ApplicationCommandInteractionOption> aciOptions = context.getAci().getOptions();
        String optionsThing = Stream.of(compareWithAciOptions(aciOptions), new PingCmd().compareWithAciOptions(aciOptions), new GuildPingCmd().compareWithAciOptions(aciOptions))
                .map(c -> c ? "Yes" : "No")
                .collect(Collectors.joining("; ")) + ".";
        EmbedCreateSpec embed = EmbedCreateSpec.builder()
                .author(author.getTag() + " says...", null, author.getAvatarUrl())
                .description("\"" + options.content + "\"")
                .timestamp(Instant.now())
                .footer(optionsThing, null)
                .build();
        logger.info("Cmd debug thing - My options: " + getOptions().toString() + "; Other Options: " + otherOptions.toString() + "; EvenMoreOptions: " + evenMoreOptions.toString() + "; aci options: " + context.getAci().getOptions().stream().map(this::aciToString).collect(Collectors.toList()));
        return context.getEvent().reply("")
                .withEmbeds(embed)
                .withAllowedMentions(AllowedMentions.suppressAll())
                .withEphemeral(options.ephemeral)
                .timeout(Duration.ofMillis(1500))
                .thenReturn(context);
    }

    @Override
    public ChatInputInteractionContextBuilder setRequestData(ChatInputInteractionContextBuilder context) {
        return context;
    }

    private static class EchoOptions {
        final String content;
        final boolean ephemeral;

        EchoOptions(OptionsList optionsList) {
            this.content = optionsList.getString("content").orElse("");
            // This may not be present, so we will provide a default value for our use case
            this.ephemeral = optionsList.getBoolean("private").orElse(false);
        }
    }

    private String aciToString(ApplicationCommandInteractionOption opt) {
        return "ApplicationCommandInteractionOption{name='" + opt.getName() + "', type=" + opt.getType() + ", options=" + Optional.ofNullable(opt.getOptions()).map(opts -> opts.stream().map(this::aciToString).collect(Collectors.toList()).toString()).orElse("[]") + "}";
    }
}

