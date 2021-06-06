import discord
import typing
from discord.message import Message
import motor.motor_asyncio
from discord_components import Component
from discord_components.message import ComponentMessage
from essentials.sender import send as csend
from discord.ext import commands
from constants import HELP_COG_SHORTCUTS

if typing.TYPE_CHECKING:
    from salt import Salt  # avoid recursive import


class CogNone:
    pass


COG_NONE = CogNone()


class SContext(commands.Context):
    """
    For typing purposes. This is our customization of the Context
    """
    channel: discord.abc.Messageable
    guild: discord.Guild
    author: typing.Union[discord.User, discord.Member]  # typing purposes & stuff

    def __init__(self, **attrs):
        super().__init__(**attrs)
        self.bot: "Salt" = self.bot
        self.message: discord.Message = self.message

    async def send(  # pylint: disable=arguments-differ
        self,
        content: str = None, *, deletable: bool = False,
        components: typing.List[typing.Union[Component, typing.List[Component]]] = None,
        **kwargs
    ) -> discord.Message:
        """|coro|
        Sends a message to the destination with the content given.
        The content must be a type that can convert to a string through ``str(content)``.
        If the content is set to ``None`` (the default), then the ``embed`` parameter must
        be provided.
        To upload a single file, the ``file`` parameter should be used with a
        single :class:`~discord.File` object. To upload multiple files, the ``files``
        parameter should be used with a :class:`list` of :class:`~discord.File` objects.
        **Specifying both parameters will lead to an exception**.
        If the ``embed`` parameter is provided, it must be of type :class:`~discord.Embed` and
        it must be a rich embed type.

        Parameters:
        ------------
        content: :class:`str`
            The content of the message to send.
        tts: :class:`bool`
            Indicates if the message should be sent using text-to-speech.
        embed: :class:`~discord.Embed`
            The rich embed for the content.
        file: :class:`~discord.File`
            The file to upload.
        files: List[:class:`~discord.File`]
            A list of files to upload. Must be a maximum of 10.
        nonce: :class:`int`
            The nonce to use for sending this message. If the message was successfully sent,
            then the message will have a nonce with this value.
        delete_after: :class:`float`
            If provided, the number of seconds to wait in the background
            before deleting the message we just sent. If the deletion fails,
            then it is silently ignored.
        deletable: :class:`bool`
            (Customized, added by Pg) If provided, add a trash can reaction on the message to be
            deleted by the member on click (if they called the command or they have Manage Messages).

        Raises
        --------
        ~discord.HTTPException
            Sending the message failed.
        ~discord.Forbidden
            You do not have the proper permissions to send the message.
        ~discord.InvalidArgument
            The ``files`` list is not of the appropriate size or
            you specified both ``file`` and ``files``.

        Returns
        ---------
        :class:`~discord.Message`
            The message that was sent.
        """
        return await csend(
            self,
            content, deletable=deletable, #sender=super().send,
            components=components,
            **kwargs
        )
    
    async def edit(  # with components
        self, message: typing.Union[Message, ComponentMessage],
        content: str = None, *,
        components: typing.List[typing.Union[Component, typing.List[Component]]] = None,
        **kwargs
    ):
        if components:
            kwargs["components"] = components
        return await self.bot.comps_instance.edit_component_msg(message, content, **kwargs)

    @property
    def db(self) -> motor.motor_asyncio.AsyncIOMotorDatabase:
        return self.bot.mondb

    async def send_help(self, *args):
        """send_help(entity=<bot>)

        |coro|

        Shows the help command for the specified entity if given.
        The entity can be a command or a cog.

        If no entity is given, then it'll show help for the
        entire bot.

        If the entity is a string, then it looks up whether it's a
        :class:`Cog` or a :class:`Command`.

        .. note::

            Due to the way this function works, instead of returning
            something similar to :meth:`~.commands.HelpCommand.command_not_found`
            this returns :class:`None` on bad input or no help command.

        Parameters
        ------------
        entity: Optional[Union[:class:`Command`, :class:`Cog`, :class:`str`]]
            The entity to show help for.

        Returns
        --------
        Any
            The result of the help command, if any.
        """

        bot = self.bot
        cmd = bot.help_command

        if cmd is None:
            return None

        cmd = cmd.copy()
        cmd.context = self
        if len(args) == 0:
            await cmd.prepare_help_command(self, None)
            mapping = cmd.get_bot_mapping()
            return await cmd.send_bot_help(mapping)

        entity = args[0]
        if entity is None:
            return None

        if isinstance(entity, str):
            new_ent = bot.get_cog(entity.lower()) or bot.get_cog(entity.title()) or bot.get_command(entity.lower())
            if not new_ent and entity.lower() in HELP_COG_SHORTCUTS:
                new_ent = bot.get_cog(HELP_COG_SHORTCUTS[entity.lower()].title())
            if not new_ent and entity.lower() in ('other', 'others'):
                new_ent = COG_NONE
            entity = new_ent

        try:
            qualified_name = entity.qualified_name
        except AttributeError:
            # if we're here then it's not a cog, group, or command.
            return None

        await cmd.prepare_help_command(self, entity.qualified_name)

        if hasattr(entity, '__cog_commands__') or entity == COG_NONE:
            return await cmd.send_cog_help(entity)
        elif isinstance(entity, commands.Group):
            return await cmd.send_group_help(entity)
        elif isinstance(entity, commands.Command):
            return await cmd.send_command_help(entity)
        else:
            return None
