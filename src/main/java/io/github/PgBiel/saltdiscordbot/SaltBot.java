package io.github.PgBiel.saltdiscordbot;

import discord4j.core.DiscordClient;
import discord4j.core.GatewayDiscordClient;
import discord4j.core.event.domain.message.MessageCreateEvent;
import discord4j.core.object.entity.Message;
import discord4j.core.object.entity.channel.MessageChannel;
import io.github.PgBiel.saltdiscordbot.config.Config;
import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;

public final class SaltBot {
    public static void main(final String[] args) {
//        final String token = args[0];
        Config config = Config.getInstance();
        final DiscordClient client = DiscordClient.create(config.getToken());
        final GatewayDiscordClient gateway = client.login().block();

        if (gateway != null) {
            gateway.on(MessageCreateEvent.class).subscribe(event -> {
                final Message message = event.getMessage();
                if ("!ping".equals(message.getContent())) {
                    final MessageChannel channel = message.getChannel().block();
                    if (channel != null) channel.createMessage("Pong!").block();
                }
            });
            gateway.onDisconnect().block();
        }

    }
}
