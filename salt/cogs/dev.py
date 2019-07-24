import discord
from discord.ext import commands
from classes import SContext, MultilineEvalNoLastExprValue
import asyncio
import ast


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
    """
    Eval a multiline string.
    :param expr: The string to eval.
    :param global_vals: The global vars.
    :param local_vals: The local vars.
    :return:
    :raise: MultilineEvalNoLastExprValue - when attempting to eval an expression.
    """
    tree = ast.parse(expr)
    ast_eval_expr = tree.body[-1]
    eval_expr = ast.Expression(ast_eval_expr.value) if hasattr(ast_eval_expr, "value") else None
    exec_expr = ast.Module(tree.body[:-1])
    exec(compile(exec_expr, '/dev/null', 'exec'), global_vals, local_vals)
    if eval_expr is not None:
        return eval(compile(eval_expr, '/dev/null', 'eval'), global_vals, local_vals)
    else:
        exec(compile(ast.Module([ast_eval_expr]), '/dev/null', 'exec'), global_vals, local_vals)
        raise MultilineEvalNoLastExprValue


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
        except MultilineEvalNoLastExprValue as e:
            result = "(No value)"
            success = True
        except Exception as err:  # pylint: disable=broad-except
            result = err
            success = False

        if (asyncio.iscoroutine(result) or asyncio.isfuture(result)) and success:
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
