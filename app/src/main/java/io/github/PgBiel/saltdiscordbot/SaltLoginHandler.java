package io.github.PgBiel.saltdiscordbot;

import botrino.api.annotation.Primary;
import botrino.api.config.ConfigContainer;
import botrino.api.config.LoginHandler;
import botrino.api.config.object.BotConfig;
import discord4j.common.ReactorResources;
import discord4j.core.DiscordClient;
import discord4j.core.GatewayDiscordClient;
import discord4j.core.object.presence.ClientPresence;
import discord4j.core.shard.MemberRequestFilter;
import discord4j.gateway.intent.IntentSet;
import reactor.core.publisher.Mono;
import reactor.util.Logger;
import reactor.util.Loggers;

import java.time.Duration;

@Primary
public final class SaltLoginHandler implements LoginHandler {
    private final static Logger logger = Loggers.getLogger(SaltLoginHandler.class);

    @Override
    public Mono<GatewayDiscordClient> login(ConfigContainer configContainer) {
        logger.info("Using SaltLoginHandler.");
        var config = configContainer.get(BotConfig.class);
        var reactor = ReactorResources.builder()
                .httpClient(ReactorResources.DEFAULT_HTTP_CLIENT.get()
                    .responseTimeout(Duration.ofSeconds(3)))
                .build();
        var discordClient = DiscordClient.builder(config.token())
                .setReactorResources(reactor)
                .build();
        return discordClient.gateway()
                .setInitialPresence(shard -> config.presence()
                        .map(BotConfig.StatusConfig::toPresence)
                        .orElseGet(ClientPresence::online))
                .setEnabledIntents(config.enabledIntents().stream().boxed()
                        .map(IntentSet::of)
                        .findAny()
                        .orElseGet(IntentSet::nonPrivileged))
                .setMemberRequestFilter(MemberRequestFilter.none())
                .login()
                .single();
    }
}
