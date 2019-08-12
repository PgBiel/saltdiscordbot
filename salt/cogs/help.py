import typing
import discord
from classes import SContext, SCommand
from discord.ext import commands
from constants import HELP_COG_SHORTCUTS
from utils.funcs import pagify_list

if typing.TYPE_CHECKING:
    from salt import Salt  # can't import for real or would have cyclic import


class HelpCogNone:
    pass


COG_NONE = HelpCogNone()


class HelpCogAll:
    pass


COG_ALL = HelpCogAll()


class Help(commands.Cog):
    def __init__(self, bot: "Salt"):
        self.bot = bot
        bot.help_command = self.SaltHelp()

    def cog_unload(self):
        self.bot.help_command = commands.DefaultHelpCommand()

    class SaltHelp(commands.HelpCommand):
        context: SContext

        async def send_bot_help(self, mapping: typing.Mapping[commands.Cog, typing.List[SCommand]]):
            ctx = self.context
            categories = {
                k.__class__.__name__.title() if k else "Others": list(
                    filter(lambda x: x and not x.hidden, v)
                ) for k, v in mapping.items()
            }

            desc = f"{ctx.bot.description}\n\nList of categories available (see `{self.clean_prefix}help <category>` \
for a list of commands in it):\n\n"
            for category, cmds in categories.items():
                if len(cmds) > 0:
                    desc += f"**{category}**: **{len(cmds)}** commands\n"

            desc = desc.strip("\n")

            footer = f"To view all {len(mapping.values())} commands, type `{self.clean_prefix}help all`."

            emb = discord.Embed(title="Help", description=desc) \
                .set_footer(text=footer)
            await ctx.send(embed=emb)

        async def send_cog_help(self, cog: typing.Union[commands.Cog, HelpCogAll, HelpCogNone], page: int = 1):
            embed = discord.Embed()
            ctx = self.context
            if isinstance(cog, commands.Cog):
                cmds = cog.get_commands()
                cmds.sort(key=lambda x: x.name)
                pages = pagify_list(cmds)

                embed.title = f'List of commands in category "{cog.__class__.__name__.title()}"'
                if len(pages) > 1:
                    embed.title += f" (Page {page}/{len(pages)})"

                embed.description = f'All commands available in that category. Type `{self.clean_prefix}help <command>`\
 to view info on a command.'
                try:
                    embed.add_field(
                        name="Commands",
                        value="• {}".format('\n• '.join(cmd.name for cmd in pages[page-1])),
                        inline=False
                    )
                except IndexError:
                    await ctx.send(f"Invalid page! Minimum is 1, and maximum is {len(pages)}.")
                    return

                await ctx.send(embed=embed)
                return

        async def command_callback(  # our case-insensitive impl.
                self, ctx, *, command: typing.Optional[str] = None
        ):
            """|coro|
            The actual implementation of the help command.
            It is not recommended to override this method and instead change
            the behaviour through the methods that actually get dispatched.
            - :meth:`send_bot_help`
            - :meth:`send_cog_help`
            - :meth:`send_group_help`
            - :meth:`send_command_help`
            - :meth:`get_destination`
            - :meth:`command_not_found`
            - :meth:`subcommand_not_found`
            - :meth:`send_error_message`
            - :meth:`on_help_command_error`
            - :meth:`prepare_help_command`
            """
            await self.prepare_help_command(ctx, command)
            bot = ctx.bot

            if command is None:
                mapping = self.get_bot_mapping()
                return await self.send_bot_help(mapping)

            # Check if it's a cog
            split_cog = command.split(' ')
            first_cog = split_cog[0].lower()
            cog: commands.Cog = bot.get_cog(first_cog) or bot.get_cog(first_cog.title())
            if cog is None and first_cog in HELP_COG_SHORTCUTS:
                cog = bot.get_cog(HELP_COG_SHORTCUTS[first_cog].title())
            if cog is None and first_cog in ('other', 'others'):
                cog = typing.cast(commands.Cog, COG_NONE)
            if cog is None and first_cog in ('all', 'alls'):
                cog = typing.cast(commands.Cog, COG_ALL)
            if cog is not None:
                possible_page = split_cog[-1]
                page = 1
                if (possible_page := split_cog[-1]) and possible_page.isnumeric() and len(possible_page) < 5:
                    page = int(possible_page)

                return await self.send_cog_help(cog, page)

            maybe_coro = discord.utils.maybe_coroutine

            # If it's not a cog then it's a command.
            # Since we want to have detailed errors when someone
            # passes an invalid subcommand, we need to walk through
            # the command group chain ourselves.
            keys = command.lower().split(' ')
            cmd = bot.all_commands.get(keys[0])
            if cmd is None:
                string = await maybe_coro(self.command_not_found, self.remove_mentions(keys[0]))
                return await self.send_error_message(string)

            for key in keys[1:]:
                try:
                    found = cmd.all_commands.get(key)
                except AttributeError:
                    string = await maybe_coro(self.subcommand_not_found, cmd, self.remove_mentions(key))
                    return await self.send_error_message(string)
                else:
                    if found is None:
                        string = await maybe_coro(self.subcommand_not_found, cmd, self.remove_mentions(key))
                        return await self.send_error_message(string)
                    cmd = found

            if isinstance(cmd, commands.Group):
                return await self.send_group_help(cmd)
            else:
                return await self.send_command_help(cmd)


def setup(bot: "Salt"):
    bot.add_cog(Help(bot))
