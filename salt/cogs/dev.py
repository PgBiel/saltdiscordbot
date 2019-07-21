import discord
from discord.ext import commands
import asyncio
import formatter
from utils import checks

def evalText(ctx: commands.Context, inp: str, outp, errored: bool = False, coro: bool = False) -> str:
  if coro:
    bottom_text = "Coro Error" if errored else "Coro Output"
  else:
    bottom_text = "Error" if errored else "Output"
  result = str(outp).replace(ctx.bot.config["token"], "[DATA EXPUNGED]")
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
    coro = False
    try:
      result = eval(arg, new_globals, locals())
      success = True
    except Exception as err:
      result = err
      success = False

    
    if asyncio.iscoroutine(result) and success:
      coro = True
      first_out_str = evalText(ctx, arg, "[Coroutine, awaiting...]", not success, False)
      msg_sent: discord.Message = await ctx.send(first_out_str)
      try:
        result = await result
        success = True
      except Exception as err:
        result = err
        success = False
      second_out_str = evalText(ctx, arg, result, not success, True)
      await msg_sent.edit(content=second_out_str)
    else:
      out_str = evalText(ctx, arg, result, not success, False)
      await ctx.send(out_str)

def setup(bot: commands.Bot) -> None:
  bot.add_cog(Dev(bot))