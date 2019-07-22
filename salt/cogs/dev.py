import discord
from discord.ext import commands
from classes.scontext import SContext
import asyncio
import formatter
import ast
from utils import checks # pylint: disable=no-name-in-module

def evalText(ctx: SContext, inp: str, outp, errored: bool = False, coro: bool = False) -> str:
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

def multiline_eval(expr: str, global_vals, local_vals):
  "Evaluate several lines of input, returning the result of the last line"
  tree = ast.parse(expr)
  eval_expr = ast.Expression(tree.body[-1].value)
  exec_expr = ast.Module(tree.body[:-1])
  exec(compile(exec_expr, '/dev/null', 'exec'), global_vals, local_vals)
  return eval(compile(eval_expr, '/dev/null', 'eval'), global_vals, local_vals)

class Dev(commands.Cog):
  @commands.is_owner()
  @commands.command(name='eval', pass_context=True, description="Just testing")
  async def eval(self, ctx: SContext, *, arg: str) -> None:
    # arg = arg.strip("`")
    
    new_globals = globals().copy()
    new_globals["self"] = self
    new_globals["ctx"] = ctx
    result = None
    success = None
    coro = False
    try:
      result = multiline_eval(arg, new_globals, locals())
      success = True
    except Exception as err: # pylint: disable=broad-except
      result = err
      success = False

    
    if asyncio.iscoroutine(result) and success:
      coro = True
      first_out_str = evalText(ctx, arg, "[Coroutine, awaiting...]", not success, False)
      msg_sent: discord.Message = await ctx.send(first_out_str, deletable=True)
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
      await ctx.send(out_str, deletable=True)
  
  # async def reloadcog(ctx: commands.Context)

def setup(bot: commands.Bot) -> None:
  bot.add_cog(Dev(bot))