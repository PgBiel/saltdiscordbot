import typing
if typing.TYPE_CHECKING:
    from salt import Salt

bot: "Salt" = typing.cast(typing.Any, None)  # we update this as the bot initializes.


def set_bot(new_bot: "Salt"):
    global bot
    bot = new_bot


def get_bot() -> "Salt":
    global bot
    return bot
