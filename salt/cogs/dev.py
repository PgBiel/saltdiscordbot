import discord
from discord.ext import commands
import asyncio
import formatter
from utils import checks

def evalText(inp: str, outp, errored: bool = False, coro: bool = False):
  #if coro:
    # thing, promise rej / promise res
  #else:
  bottom_text = "Error" if errored else "Output"
  result = str(outp)
  return f"""
```py
Input
{inp}
{bottom_text}
{result}
```"""

class Dev(commands.Cog):
  @commands.is_owner()
  @commands.command(name='eval', pass_context=True)
  async def eval(self, ctx: commands.Context, *, arg: str) -> None:
    # arg = arg.strip("`")
    
    new_globals = globals().copy()
    new_globals["self"] = self
    new_globals["ctx"] = ctx
    result = None
    success = None
    try:
      result = eval(arg, new_globals, locals())
      success = True
    except Exception as err:
      result = err
      success = False

    out_str = evalText(arg, result, not success, False)
    await ctx.send(out_str)

def setup(bot: commands.Bot) -> None:
  bot.add_cog(Dev(bot))