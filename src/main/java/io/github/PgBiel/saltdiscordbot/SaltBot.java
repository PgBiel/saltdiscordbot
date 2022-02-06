package io.github.PgBiel.saltdiscordbot;

import discord4j.common.ReactorResources;
import discord4j.core.DiscordClient;
import discord4j.core.DiscordClientBuilder;
import discord4j.core.GatewayDiscordClient;
import discord4j.core.event.EventDispatcher;
import io.github.PgBiel.saltdiscordbot.commands.SaltInteractionEventReceiver;
import io.github.PgBiel.saltdiscordbot.commands.utility.*;
import io.github.PgBiel.saltdiscordbot.config.Config;
import io.netty.channel.ChannelOption;
import io.netty.channel.socket.nio.NioChannelOption;
import jdk.net.ExtendedSocketOptions;
import net.exploitables.slashlib.CommandRegister;
import net.exploitables.slashlib.CommandStructure;
import net.exploitables.slashlib.SlashLib;
import net.exploitables.slashlib.SlashLibBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.ConnectionProvider;

import java.time.Duration;
import java.util.*;

public final class SaltBot {
    public static final Logger LOGGER = LoggerFactory.getLogger(SaltBot.class);

    private static DiscordClient discordClient;
    private static SlashLib slashLib;
    private static GatewayDiscordClient discordGateway;
    private static long applicationId;

    public static void main(final String[] args) {
//        final String token = args[0];
        LOGGER.info("Salt is booting up!");
        Config config = Config.getInstance();
        discordClient = DiscordClientBuilder.create(config.getToken())
                .setReactorResources(ReactorResources.builder()
                        .httpClient(HttpClient.create()
                                .option(ChannelOption.SO_KEEPALIVE, true)
                                .option(NioChannelOption.of(ExtendedSocketOptions.TCP_KEEPIDLE), 9*60)  // 9 mins
                                .option(NioChannelOption.of(ExtendedSocketOptions.TCP_KEEPINTERVAL), 3*60) // 3 mins
                                .option(NioChannelOption.of(ExtendedSocketOptions.TCP_KEEPCOUNT), 8))
                        .build()).build();
        EventDispatcher dispatcher = EventDispatcher.builder().build();

        // Setup Commands and SlashLib
        SlashLibBuilder slashLibBuilder = new SlashLibBuilder();
        slashLibBuilder.setReceiver(new SaltInteractionEventReceiver());
        // Add Chat Input commands
        slashLibBuilder.addChatCommand(new PingCmd());
        slashLibBuilder.addChatCommand(new GuildPingCmd());
        slashLibBuilder.addChatCommand(new EchoCmd());

        GuildMsgCmd gMsgCmd = new GuildMsgCmd();
        slashLibBuilder.addMessageCommand(gMsgCmd);

        slashLibBuilder.addUserCommand(new UserHiCmd());
        slashLibBuilder.addUserCommand(new UserByeCmd());

        slashLib = slashLibBuilder.build();
        slashLib.registerAsListener(dispatcher);

        // Login to discord
        discordGateway = discordClient.gateway()
                .setEventDispatcher(dispatcher)
                .login()
                .block();

        Objects.requireNonNull(discordGateway);

        // Register Slash Commands
        Long nullableApplicationId = discordClient.getApplicationId().block();
        Objects.requireNonNull(nullableApplicationId);
        applicationId = nullableApplicationId;
        CommandRegister cmdRegister = slashLib.getCommandRegister();
//        CommandStructure cmdStructure = cmdRegister.getCommandStructure();
        cmdRegister.registerCommands(discordClient.getApplicationService(), applicationId, 193903425640071168L);

        // Block until disconnect
        discordGateway.onDisconnect().block();
//        if (gateway != null) {
//            gateway.on(MessageCreateEvent.class).subscribe(event -> {
//                final Message message = event.getMessage();
//                if ("!ping".equals(message.getContent())) {
//                    final MessageChannel channel = message.getChannel().block();
//                    if (channel != null) channel.createMessage("Pong!").block();
//                }
//            });
//            LOGGER.info("Salt's up!");
//            gateway.onDisconnect().block();
//        } else {
//            LOGGER.error("Could not get gateway... something is very wrong.");
//        }

    }
}
