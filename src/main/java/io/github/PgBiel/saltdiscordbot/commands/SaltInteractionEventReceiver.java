package io.github.PgBiel.saltdiscordbot.commands;

import discord4j.core.event.domain.interaction.ChatInputInteractionEvent;
import discord4j.core.event.domain.interaction.InteractionCreateEvent;
import discord4j.core.event.domain.interaction.MessageInteractionEvent;
import discord4j.core.event.domain.interaction.UserInteractionEvent;
import discord4j.gateway.GatewayClient;
import net.exploitables.slashlib.InteractionEventReceiverImpl;
import net.exploitables.slashlib.context.ChatInputInteractionContext;
import net.exploitables.slashlib.context.MessageInteractionContext;
import net.exploitables.slashlib.context.UserInteractionContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

import java.util.Optional;

public class SaltInteractionEventReceiver extends InteractionEventReceiverImpl {
    private final static Logger logger = LoggerFactory.getLogger(SaltInteractionEventReceiver.class);

    private Mono<Object> checkIsConnected(InteractionCreateEvent event) {
        Optional<GatewayClient> maybeGateway = event.getClient().getGatewayClient(event.getShardInfo().getIndex());
        if (maybeGateway.isPresent()) {
            GatewayClient gateway = maybeGateway.get();
            return gateway.isConnected().flatMap(isConn -> Mono.defer(() -> {
                logger.info("Is gateway connected? Answer: " + isConn);
                return Mono.empty();
            })).flatMap(ignore -> Mono.empty());
        }
        return Mono.empty();
    }

    @Override
    public Mono<ChatInputInteractionContext> receiveChatInputInteractionEvent(ChatInputInteractionEvent event) {
        logger.info("Received CHAT_INPUT interaction event!");
        return checkIsConnected(event).defaultIfEmpty(1).flatMap(i -> super.receiveChatInputInteractionEvent(event));
    }

    @Override
    public Mono<UserInteractionContext> receiveUserInteractionEvent(UserInteractionEvent event) {
        logger.info("Received USER interaction event!");
        return super.receiveUserInteractionEvent(event);
    }

    @Override
    public Mono<MessageInteractionContext> receiveMessageInteractionEvent(MessageInteractionEvent event) {
        logger.info("Received MESSAGE interaction event!");
        return super.receiveMessageInteractionEvent(event);
    }
}
