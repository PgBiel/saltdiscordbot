package io.github.PgBiel.saltdiscordbot;

import botrino.interaction.annotation.ChatInputCommand;
import botrino.interaction.listener.ChatInputInteractionListener;
import botrino.interaction.context.ChatInputInteractionContext;
import org.reactivestreams.Publisher;

@ChatInputCommand(name = "ping", description = "Pings the bot to check if it is alive.")
public final class PingCommand implements ChatInputInteractionListener {

    @Override
    public Publisher<?> run(ChatInputInteractionContext ctx) {
        return ctx.event().createFollowup(ctx.translate(Strings.APP, "pong"));
    }
}
