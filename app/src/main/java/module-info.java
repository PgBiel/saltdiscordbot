import botrino.api.annotation.BotModule;

@BotModule
open module io.github.PgBiel.saltdiscordbot {

    requires botrino.interaction;
    requires reactor.netty.http;
}