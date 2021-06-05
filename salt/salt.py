import asyncio
import discord
import traceback
import sys
import motor.motor_asyncio
import typing
import datetime
import re
from typing import List, Tuple
from discord.ext import commands
from utils.funcs.jsonwork import load as json_load
from utils.funcs import humanize_perm, humanize_list, salt_loop, set_bot, permission_tuple_to_literal, plural_s
from constants import DEFAULT_PREFIX
from classes import (
    SContext, RepeatedTimer, SCommand,
    MissingSaltModRole, MissingSaltAdminRole, NoPermissions,
    NoConfiguredSaltModRole, NoConfiguredSaltAdminRole,
    AutoCancelledException, InvalidIntegerArg,
    BotMissingOneChannelPermissions, BotMissingThisChannelPermissions,
    MissingSaltPermissions
)

description = """
Salt Bot - moderation, administration, utility and fun all in one!
"""

cogs_ext_list = (
    "cogs.test",
    "cogs.dev",
    "cogs.admin",
    "cogs.mod",
    "cogs.utility",
    "cogs.information",
    "cogs.fun",
    "cogs.mutecheck",
    "cogs.help"
)

intents = discord.Intents.default()
intents.typing = False
intents.presences = True  # False - set to False on prod
intents.members = True

class Salt(commands.Bot):

    def __init__(self):
        set_bot(self)

        super().__init__(
            command_prefix=self.prefix, description=description, case_insensitive=True,
            intents=intents
        )
        self.uptime: datetime.datetime = None
        self.saved_permissions: List[Tuple[str, ...]] = []  # List of permissions that are being checked by commands.
        self.config: dict = dict()
        self.load_config()

        for cog_ext in cogs_ext_list:
            print(cog_ext)
            try:
                self.load_extension(cog_ext)
            except commands.ExtensionError as _err:
                print(f'Failed to load extension {cog_ext}.', file=sys.stderr)
                traceback.print_exc()

        monclient = motor.motor_asyncio.AsyncIOMotorClient()
        self.monclient: motor.motor_asyncio.AsyncIOMotorClient = monclient
        self.mondb: motor.motor_asyncio.AsyncIOMotorDatabase = self.monclient.salt
        self.debug = False

    async def prefix(self, _bot, msg: discord.Message) -> List[str]:
        """
        Get the prefix to be used to invoke commands.

        :param _bot: The bot instance. (Ignored!)
        :param msg: The message sent.
        :return:
        """
        # ctx = await self.get_context(msg)  # THIS CAUSES RECURSION
        user_id = self.user.id
        member_ping_prefix = '<@!{0}> '.format(user_id)
        ping_prefix = '<@{0}> '.format(user_id)
        prefixes: typing.List[str] = list([ping_prefix, member_ping_prefix])
        if msg.guild:
            prefixes_col = self.mondb['prefixes']
            g_entry = await prefixes_col.find_one(dict(guild_id=str(msg.guild.id)))
            if g_entry and (g_prefix := g_entry['prefix']):
                used_prefix = g_prefix or DEFAULT_PREFIX
                if (
                    msg.content.startswith(used_prefix)
                    and used_prefix != DEFAULT_PREFIX
                    and re.match(
                        r'^(?:(?:prefix|eval|repl|cogs?) |(?:prefix|eval|repl|cogs?))',
                    msg.content[len(used_prefix):], re.RegexFlag.I
                    )
                ):
                    return prefixes  # don't allow them to be invoked with other than default prefix
                elif (
                    msg.content.startswith(DEFAULT_PREFIX)
                    and re.match(
                        r'^(?:(?:prefix|eval|repl|cogs?) |(?:prefix|eval|repl|cogs?))',
                        msg.content[len(DEFAULT_PREFIX):], re.RegexFlag.I
                    )
                ):
                    prefixes.append(DEFAULT_PREFIX)  # Those cmds only accept the default prefix.
                else:
                    prefixes.append(g_prefix or DEFAULT_PREFIX)
            else:
                prefixes.append(DEFAULT_PREFIX)
        else:
            prefixes.append(DEFAULT_PREFIX)
        return prefixes

    def run(self) -> None:
        try:
            super().run(self.config["token"])
        finally:
            salt_loop.close()

    def load_config(self) -> None:
        parsed_config = json_load("../config.json")
        self.config = parsed_config

    def get_context(self, msg: discord.Message, *_args) -> typing.Coroutine[typing.Any, typing.Any, SContext]:
        """|coro|
        """
        return super().get_context(msg, cls=SContext)

    async def on_ready(self):
        if not self.uptime:
            self.uptime = datetime.datetime.utcnow()

        print("Salt is ready!")

    async def on_message(self, message: discord.Message):
        if message.author.bot or message.author == self.user:
            return
        await self.process_commands(message)

    async def on_command_error(self, ctx: SContext, error: BaseException) -> None:
        """
        Handle errors in commands.
        the exception trees are as follows:
        # /discord/errors.py
        DiscordException
         +-- ClientException
         |    +-- ConnectionClosed
         |    +-- InvalidArgument
         |    +-- LoginFailure
         +-- GatewayNotFound
         +-- HTTPException
         |    +-- Forbidden
         |    +-- NotFound
         +-- NoMoreItems
        # /discord/ext/commands/errors.py
        DiscordException
         +-- CommandError
         |    +-- CheckFailure
         |    |    +-- BotMissingAnyRole
         |    |    +-- BotMissingPermissions
         |    |    +-- BotMissingRole
         |    |    +-- MissingAnyRole
         |    |    +-- MissingPermissions
         |    |    +-- MissingRole
         |    |    +-- NoPrivateMessage
         |    |    +-- NotOwner
         |    |    +-- NSFWChannelRequired
         |    |    +-- PrivateMessageOnly
         |    +-- CommandInvokeError
         |    +-- CommandNotFound
         |    +-- CommandOnCooldown
         |    +-- ConversionError
         |    +-- DisabledCommand
         |    +-- UserInputError
         |         +-- ArgumentParsingError
         |         |    +-- ExpectedClosingQuoteError
         |         |    +-- InvalidEndOfQuotedStringError
         |         |    +-- UnexpectedQuoteError
         |         +-- BadArgument
         |         +-- BadUnionArgument
         |         +-- MissingRequiredArgument
         |         +-- TooManyArguments
         +-- ExtensionError
              +-- ExtensionAlreadyLoaded
              +-- ExtensionFailed
              +-- ExtensionNotFound
              +-- ExtensionNotLoaded
              +-- NoEntryPointError

        :param ctx: The context.
        :param error: The error that occurred.
        :return: None
        """
        if self.debug:
            print(f'In {ctx.command.qualified_name}:', file=sys.stderr)
            traceback.print_tb(error.__traceback__)
            print(f'{error.__class__.__name__}: {error}', file=sys.stderr)

        if isinstance(error, AutoCancelledException):
            return

        if isinstance(error, commands.NoPrivateMessage):
            await ctx.send('This command cannot be used in private messages!')
            return

        if isinstance(error, commands.CommandNotFound):
            return

        if isinstance(error, commands.DisabledCommand):
            await ctx.send('This command is disabled!')
            return

        if isinstance(error, commands.CommandOnCooldown):
            await ctx.send(
                f'**Chill, pal!** You\'ll be able to use this command in **{str(error.retry_after)[:4]} seconds**.'
            )
            return

        if isinstance(error, commands.BadArgument):
            try:
                fmt = 'You gave an invalid parameter{0}'
                # if cause := error.__cause__:
                #     if isinstance(cause, InvalidIntegerArg):
                #         await ctx.send(
                #             fmt.format(f": Parameter '{name}' must be a valid integer and {cause.range_str}")
                #         )
                #         return

                if (match := re.fullmatch(
                    r'Converting to "(?P<type>[^"]+)" failed for parameter "(?P<name>[^"]+)"\.?',
                    str(error)
                )):
                    fail_type = match.group("type").lower()
                    name = match.group("name").lower()
                    if fail_type == "int":
                        await ctx.send(fmt.format(f": Parameter '{name}' must be a valid integer!"))
                        return
                    elif fail_type == "float":
                        await ctx.send(fmt.format(f": Parameter '{name}' must be a valid number!"))
                        return
                    elif fail_type == "bool":
                        await ctx.send(fmt.format(f": Parameter '{name}' must be one of 'yes', 'on', 'off', 'no', ..."))
                        return
                elif str(error).lower().endswith("is not a recognised boolean option"):
                    await ctx.send(fmt.format(
                        f": Specify a valid boolean option (one of 'yes', 'on', 'off', 'no', 'true', 'false'...)."
                    ))
                    return

                await ctx.send(
                    fmt.format(f": {str(error)}" if str(error) else "!")
                )
            except discord.HTTPException:
                await ctx.send(
                    "You gave an invalid parameter! (The message was too big/couldn't be displayed.)"
                )
            return

        if isinstance(error, commands.MissingRequiredArgument):
            await ctx.send("Missing required parameter {0!r}!".format(error.param.name))
            return

        if isinstance(error, commands.TooManyArguments):
            await ctx.send("Too many parameters specified!")
            return

        if isinstance(error, commands.ArgumentParsingError):
            if isinstance(error, commands.UnexpectedQuoteError):
                await ctx.send("You wrote a quote (\" or ') in the wrong spot! If you want to literally write down \
a quote, make sure to add a backslash \\\\ before it! :smiley:")
                return

            if isinstance(error, commands.ExpectedClosingQuoteError):
                await ctx.send("You started writing a parameter with a quote (\" or ') before it, but didn't close it \
with another of the same kind of quote, so I got confused! :frowning:")
                return

            if isinstance(error, commands.InvalidEndOfQuotedStringError):
                await ctx.send("After surrounding a command parameter with quotes, please ensure you add a space after \
it so I know where the following one starts! :smiley: I am confused right now...")
                return

        if isinstance(error, commands.CheckFailure):
            if isinstance(error, commands.NotOwner):
                return
            if isinstance(error, MissingSaltPermissions):
                origin_list = [
                    f"`{permission_tuple_to_literal(p) if type(p) in (tuple, list) else p}`"
                    for p in error.missing_perms
                ]
                humanized = humanize_list(origin_list)
                await ctx.send(f"You're missing the {humanized} saltperm{plural_s(origin_list)}!")
                return

            if isinstance(error, commands.BotMissingPermissions) or isinstance(error, commands.MissingPermissions):
                missing: List[str] = error.missing_perms
                hum_missing = [humanize_perm(perm) for perm in missing]
                pronouns = ("I", "I'm") if isinstance(error, commands.BotMissingPermissions) \
                    else ("You", "You're")
                await ctx.send("{0} don't have enough Discord Permissions for this! {1} missing permission{2} {3}."
                               .format(
                                    pronouns[0], pronouns[1],
                                    "s" if len(missing) > 1 else "",
                                    humanize_list(hum_missing)
                               )
                               )
                return

            if isinstance(error, BotMissingOneChannelPermissions) or isinstance(error, BotMissingThisChannelPermissions):
                missing: List[str] = error.missing_perms
                hum_missing = [humanize_perm(perm) for perm in missing]
                fmt = "I don't have enough Discord Permissions (in this channel, at least) for this! I'm missing \
permission{0} {1}." if isinstance(error, BotMissingThisChannelPermissions) else "I don't have the permission{0} {1} in \
any of this server's channels!"
                await ctx.send(fmt.format("s" if len(missing) > 1 else "", humanize_list(hum_missing)))
                return

            if isinstance(error, commands.BotMissingRole) or isinstance(error, commands.MissingRole):
                role_given: typing.Union[str, int] = error.missing_role
                pronouns = ("I", "I'm") if isinstance(error, commands.BotMissingRole) else ("You", "You're")
                role_name: str = ""
                if isinstance(role_given, int):
                    role_in_guild: discord.Role = ctx.guild.get_role(role_given)
                    if role_in_guild is None:
                        await ctx.send("You're missing some unknown role!")
                        return
                    else:
                        role_name = role_in_guild.name
                else:
                    role_name = role_given

                await ctx.send("{0} missing the role {1!r} required for this command!".format(pronouns[1], role_name))
                return

            if isinstance(error, commands.BotMissingAnyRole) or isinstance(error, commands.MissingAnyRole):
                roles_given: List[typing.Union[str, int]] = error.missing_roles
                pronouns = ("I", "I'm") if isinstance(error, commands.BotMissingAnyRole) else ("You", "You're")
                role_names: List[str] = []
                for role_given in roles_given:
                    if isinstance(role_given, int):
                        role_in_guild: discord.Role = ctx.guild.get_role(role_given)
                        if role_in_guild is None:
                            role_names.append("(Unknown Role)")
                            continue
                        else:
                            role_names.append("'{0}'".format(role_in_guild.name))
                    else:
                        role_names.append("'{0}'".format(role_given))
                await ctx.send(
                    "{0} missing at least one of the following roles required for this command: {1}"
                    .format(pronouns[1], humanize_list(role_names, connector="or"))
                )
                return

            if isinstance(error, MissingSaltModRole) or isinstance(error, MissingSaltAdminRole):
                await ctx.send(
                    "You're missing this server's Salt {0.title()} Role(s)! (See the `salt{0}` command for info.)"
                    .format("mod" if isinstance(error, MissingSaltModRole) else "admin")
                )
                return

            if isinstance(error, NoConfiguredSaltModRole) or isinstance(error, NoConfiguredSaltAdminRole):
                await ctx.send(
                    "This server did not configure any Salt {0.title()} Role(s)! (See the `salt{0}` command for info.)"
                    .format("mod" if isinstance(error, NoConfiguredSaltModRole) else "admin")
                )
                return

            if isinstance(error, NoPermissions):
                if str(error) != "":
                    await ctx.send(str(error))
                else:
                    await ctx.send("You do not have any of this command's required permissions! See its `help` page.")
                return

            await ctx.send("You cannot use this command!")
            return
            # TODO: Catch more types of errors.

        if hasattr(error, "original"):
            original = error.original
            if isinstance(original, discord.Forbidden):
                await ctx.send("I don't have enough Discord Permissions to execute this command! :frowning:")
                return

            if isinstance(original, discord.HTTPException):
                await ctx.send("It seems communication with Discord failed! (Perhaps I tried to send something \
too big?) :frowning:")
                return

            if isinstance(original, asyncio.TimeoutError):
                await ctx.send("Timeout.")
                return

            print(f'In {ctx.command.qualified_name}:', file=sys.stderr)
            traceback.print_tb(original.__traceback__)
            print(f'{original.__class__.__name__}: {original}', file=sys.stderr)
            await ctx.send("There was an unexpected error in the command!")
            return

        print(f'In {ctx.command.qualified_name}:', file=sys.stderr)
        traceback.print_tb(error.__traceback__)
        print(f'{error.__class__.__name__}: {error}', file=sys.stderr)
        await ctx.send("There was an unexpected error in the command!")
        return
