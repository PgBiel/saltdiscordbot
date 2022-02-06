package io.github.PgBiel.saltdiscordbot.commands.utility;

import discord4j.core.object.entity.User;
import discord4j.rest.util.AllowedMentions;
import net.exploitables.slashlib.commands.UserCommand;
import net.exploitables.slashlib.context.UserInteractionContext;
import net.exploitables.slashlib.context.UserInteractionContextBuilder;
import reactor.core.publisher.Mono;

public class UserHiCmd extends UserCommand {
    public UserHiCmd() {
        super("Say Hi");
//        restrictToGuildIDs(288362234780844032L);
    }

    @Override
    public Mono<UserInteractionContext> executeUser(UserInteractionContext context) {
        User author = context.getCallingUser();
        User target = context.getTargetUser();
        return context
                .getEvent().deferReply().withEphemeral(true)
                .then(
                    target.getPrivateChannel()
                        .flatMap(ch -> ch.createMessage("The user " + author.getMention() + " is saying hi to you!")
                                    .withAllowedMentions(AllowedMentions.builder().allowUser(author.getId()).build()))
                        .flatMap(ignore -> context.getEvent().createFollowup("Sent hi to " + target.getMention() + " successfully.").withEphemeral(true))
                        .onErrorResume(err -> context.getEvent().createFollowup("Could not send hi for some reason...").withEphemeral(true).then(Mono.error(err)))
                        .thenReturn(context));
    }

    @Override
    public UserInteractionContextBuilder setRequestData(UserInteractionContextBuilder builder) {
        builder.requireCallingUser();
        builder.requireTargetUser();
        return builder;
    }
}
