import os
import asyncio
import discord
import traceback
import sys
import motor.motor_asyncio
import typing
from typing import List
from discord.ext import commands
from utils.jsonwork import load as json_load
from utils import humanize_perm
from classes import SContext, MissingSaltModRole, MissingSaltAdminRole, NoPermissions

description = """
Salt Bot, moderation, administration, utility and fun all in one!
"""

cogs_ext_list = (
    "cogs.test",
    "cogs.dev",
    "cogs.mod"
)


class Salt(commands.Bot):

    def __init__(self):
        super().__init__(command_prefix=self.prefix, description=description)
        self.config: dict = dict()
        self.make_config()
        for cog_ext in cogs_ext_list:
            print(cog_ext)
            try:
                self.load_extension(cog_ext)
            except Exception as _err:
                print(f'Failed to load extension {cog_ext}.', file=sys.stderr)
                traceback.print_exc()
        self.monclient: motor.motor_asyncio.AsyncIOMotorClient = motor.motor_asyncio.AsyncIOMotorClient()
        self.mondb: motor.motor_asyncio.AsyncIOMotorDatabase = self.monclient.salt

    def prefix(self, _bot, msg: discord.Message) -> list:
        # ctx = self.get_context(msg)
        user_id = self.user.id
        member_ping_prefix = '<@!{0}> '.format(user_id)
        ping_prefix = '<@{0}> '.format(user_id)
        prefixes = list([ping_prefix, member_ping_prefix])
        prefixes.append('+')  # gonna wait until later to add per-guild prefix
        return prefixes

    def run(self) -> None:
        super().run(self.config["token"])

    def make_config(self) -> None:
        parsed_config = json_load("../config.json")
        self.config = parsed_config

    def get_context(self, msg: discord.Message, *_args) -> typing.Coroutine[typing.Any, typing.Any, SContext]:
        """|coro|
        """
        return super().get_context(msg, cls=SContext)

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
        if isinstance(error, commands.NoPrivateMessage):
            await ctx.send('This command cannot be used in private messaging!')
            return

        if isinstance(error, commands.CommandNotFound):
            return

        if isinstance(error, commands.DisabledCommand):
            await ctx.author.send('This command is disabled!')
            return

        if isinstance(error, commands.CheckFailure):
            if isinstance(error, commands.BotMissingPermissions) or isinstance(error, commands.MissingPermissions):
                missing: List[str] = error.missing_perms
                hum_missing = [humanize_perm(perm) for perm in missing]
                pronouns = ("I", "I'm") if isinstance(error, commands.BotMissingPermissions) \
                    else ("You", "You're")
                await ctx.send("{0} don't have enough Discord Permissions for this! {1} missing permission{2} {3}.".format(
                                    pronouns[0], pronouns[1],
                                    "s" if len(missing) > 1 else None,
                                    hum_missing[0] if len(missing) < 2 else (
                                        "{0}{1} and {2}".format(
                                            hum_missing[:-1], "," if len(missing) > 2 else None,
                                            hum_missing[-1]
                                        )
                                    )
                                )
                )
                return

            if isinstance(error, MissingSaltModRole) or isinstance(error, MissingSaltAdminRole):
                await ctx.send(
                    "You're missing this server's Salt {0.title()} Role(s)! (See the `salt{0}` command for info.)"
                        .format("mod" if isinstance(error, MissingSaltModRole) else "admin")
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

        if hasattr(error, "original"):
            original = error.original
            if isinstance(original, discord.Forbidden):
                await ctx.send("I don't have enough Discord Permissions to execute this command! :frown:")
                return

            if isinstance(original, discord.HTTPException):
                await ctx.send("It seems communication with Discord failed! (Perhaps I tried to send something \
too big?) :frown:")
                return

            if isinstance(original, asyncio.TimeoutError):
                await ctx.send("Timeout.")
                return

            print(f'In {ctx.command.qualified_name}:', file=sys.stderr)
            traceback.print_tb(error.original.__traceback__)
            print(f'{error.original.__class__.__name__}: {error.original}', file=sys.stderr)
            await ctx.send("There was an unexpected error in the command!")
            return
