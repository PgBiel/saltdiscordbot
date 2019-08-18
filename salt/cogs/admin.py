import typing
import re
import math
from discord.ext import commands
from constants import (
    PREFIX_LIMIT, DEFAULT_PREFIX, TIME_SPLIT_REGEX, MUTE_REGEX_NO_REASON, TIME_MATCH, TIME_ALIASES
)
from classes import (
    scommand, SContext, PrefixesModel, PartialPrefixesModel, set_op, NoPermissions, PartialWarnExpiresModel,
    WarnExpiresModel
)
from dateutil.relativedelta import relativedelta
from utils.funcs import discord_sanitize, humanize_delta, dict_except, delta_compress, delta_decompress
from utils.advanced import or_checks, has_saltadmin_role, is_owner

administration_dperm_error_fmt = "Missing permissions! For this command, you need either Manage Server, \
a Salt Mod role or the `{0}` saltperm."


class Administration(commands.Cog):

    @or_checks(
        is_owner(), has_saltadmin_role(), commands.has_permissions(manage_guild=True),
        error=NoPermissions(administration_dperm_error_fmt.format('prefix'))
    )
    @scommand(name='prefix', description='Views or changes the prefix of the server.')
    async def prefix(self, ctx: SContext, *, new_prefix: typing.Optional[str]):
        prefixes = ctx.db['prefixes']
        found = await prefixes.find_one(dict(guild_id=str(ctx.guild.id)))  # get this guild's prefix
        if new_prefix:
            if not ctx.author.guild_permissions.manage_guild:
                raise commands.MissingPermissions(missing_perms=["manage_guild"])
            if len(new_prefix) > PREFIX_LIMIT:
                await ctx.send(f"Too big! The max prefix length is **{PREFIX_LIMIT} characters**. (Remember: \
any kind of mentions - user, channel or role mentions - and custom emojis represent a larger amount of \
characters than you see!)")
                return
            if found:  # If there already was a custom prefix in database, then change it
                await prefixes.update_one(
                    PartialPrefixesModel(guild_id=str(ctx.guild.id)).as_dict(),
                    set_op(PartialPrefixesModel(prefix=new_prefix).as_dict())
                )
            else:
                await prefixes.insert_one(
                    PrefixesModel(guild_id=str(ctx.guild.id), prefix=new_prefix).as_dict()
                )
            await ctx.send(f"Successfully set the server prefix to '{discord_sanitize(new_prefix)}'! Keep in mind that \
this command in specific doesn't change its prefix.")
        else:
            curr_prefix = found['prefix'] if found else DEFAULT_PREFIX
            await ctx.send(f"This server's current prefix is '{curr_prefix or DEFAULT_PREFIX}'!")

    @or_checks(
        is_owner(), has_saltadmin_role(), commands.has_permissions(manage_guild=True),
        error=NoPermissions(administration_dperm_error_fmt.format('warnexpire'))
    )
    @scommand(name='warnexpire', description='Set the amount of time it takes for a warn to "expire" ((stop counting \
towards warn limits).')
    async def warnexpire(self, ctx: SContext, *, time: typing.Optional[str] = None):
        if not time:
            current: dict = await ctx.db['warnexpires'].find_one(dict(guild_id=ctx.guild.id))
            c_model = PartialWarnExpiresModel(**(dict_except(current, "_id") if current else dict()))
            expiry_time = delta_decompress(c_model.expires) if c_model.expires else relativedelta(weeks=1)
            await ctx.send(f"This server's warns expire after {humanize_delta(expiry_time)}!")
            return

        if not re.match(MUTE_REGEX_NO_REASON, time, re.RegexFlag.I | re.RegexFlag.X):
            await ctx.send("Invalid time specified!")
            return

        time = time.strip("\"'").strip().replace(",", "").replace("and", "") .replace("+", "").replace("-", "")
        # Do some cleaning in the house

        parsed = re.findall(TIME_SPLIT_REGEX, time, flags=re.RegexFlag.I | re.RegexFlag.X)
        try:
            units = dict()
            # Here we separate each part of time - ["5 years", "5 seconds"] - to add to our delta
            for part in parsed:
                p_match = re.fullmatch(TIME_MATCH, part, flags=re.RegexFlag.I)  # Now let's separate "5" from "years"
                num_str, time_str = (p_match.group("number"), p_match.group("unit"))  # ^
                amount = float(num_str)  # Convert to float, or error if too big (see try/except)
                unit = TIME_ALIASES[time_str.lower()]  # Unit using
                if unit in ("years", "months"):  # On 'years' and 'months', can only use int, not float
                    amount = math.floor(amount)  # On the rest we can use floats tho so it's ok
                if units.get(unit):  # If the user already specified this unit before, just sum (5s + 5s)
                    units[unit] += amount
                else:  # Else just add to our dict
                    units[unit] = amount

            expire_time = relativedelta(**units)  # Using the units parsed, we are good to go.
        except (OverflowError, OSError, ValueError):  # Oh no, num too big
            await ctx.send("You specified a number that is too big!")
            return

        await ctx.db['warnexpires'].update_one(
            dict(guild_id=str(ctx.guild.id)),
            set_op(WarnExpiresModel(guild_id=str(ctx.guild.id), expires=delta_compress(expire_time)).as_dict()),
            upsert=True
        )
        await ctx.send(f"Successfully updated time for warn expire to {humanize_delta(expire_time) or '0 seconds'}!")


def setup(bot: commands.Bot):
    bot.add_cog(Administration(bot))
