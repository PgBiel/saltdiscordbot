import discord
import asyncio
import ast
from discord.ext import commands
from classes import SContext, MultilineEvalNoLastExprValue, scommand, sgroup
from utils.advanced import sdev_only
from utils.funcs import privacy_sanitize, is_awaitable


def eval_text(ctx: SContext, inp: str, outp, errored: bool = False, coro: bool = False) -> str:
    if coro:
        bottom_text = "Coro Error" if errored else "Coro Output"
    else:
        bottom_text = "Error ({0.__class__.__name__})".format(outp) if errored else "Output"
    result = privacy_sanitize(str(outp), ctx)
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
    exec_expr = ast.Module(tree.body[:-1], type_ignores=[])
    exec(compile(exec_expr, '/dev/null', 'exec'), global_vals, local_vals)
    if eval_expr is not None:
        return eval(compile(eval_expr, '/dev/null', 'eval'), global_vals, local_vals)
    else:
        exec(compile(ast.Module([ast_eval_expr], type_ignores=[]), '/dev/null', 'exec'), global_vals, local_vals)
        raise MultilineEvalNoLastExprValue


class Dev(commands.Cog):
    @sdev_only()
    @scommand(name='eval', pass_context=True, description="Just testing", hidden=True)
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

        if is_awaitable(result) and success:
            coro = True
            first_out_str = eval_text(ctx, arg, "[Coroutine, awaiting...]", not success, False)
            msg_sent: discord.Message = await ctx.send(first_out_str, deletable=True)
            try:
                result = await result
                success = True
            except Exception as err:
                result = err
                success = False
            second_out_str = eval_text(ctx, arg, result, not success, True)
            await msg_sent.edit(content=second_out_str)
        else:
            out_str = eval_text(ctx, arg, result, not success, False)
            await ctx.send(out_str, deletable=True)

    @sdev_only()
    @scommand(name='say', description="Make Salt talk.")
    async def say(self, ctx: SContext, *, text_to_say: str):
        await ctx.send(text_to_say[:2000])

    @sdev_only()
    @sgroup(name='cog', description="Cog work, see subcommands.", aliases=["cogs"])
    async def cog(self, *args, **kwargs):
        pass

    @sdev_only()
    @cog.command(name='reload', description="Reload cogs.")
    async def reloadcog(self, ctx: SContext, *, arg: str):
        msg = None
        try:
            msg = await ctx.send(f"Reloading cog **{arg}**...")
        except discord.HTTPException:
            pass

        try:
            ctx.bot.reload_extension(arg)
            if msg is not None:
                await msg.edit(content=f"Successfully reloaded cog **{arg}**.")
        except commands.ExtensionError as err:
            if msg is not None:
                await msg.edit(content=f"Failed to reload cog **{arg}**:\n{err.__class__.__name__}: {str(err)}")
            print("Manual cog {0!r} reload failed: {1}: {2}".format(arg, err.__class__.__name__, str(err)))

    @sdev_only()
    @cog.command(name='load', description="Load cogs.")
    async def loadcogs(self, ctx: SContext, *, arg: str):
        msg = None
        try:
            msg = await ctx.send(f"Loading cog **{arg}**...")
        except discord.HTTPException:
            pass

        try:
            ctx.bot.load_extension(arg)
            if msg is not None:
                await msg.edit(content=f"Successfully loaded cog **{arg}**.")
        except commands.ExtensionError as err:
            if msg is not None:
                await msg.edit(content=f"Failed to load cog **{arg}**:\n{err.__class__.__name__}: {str(err)}")
            print("Manual cog {0!r} load failed: {1}: {2}".format(arg, err.__class__.__name__, str(err)))\

    @sdev_only()
    @cog.command(name='unload', description="Reload cogs.")
    async def unloadcog(self, ctx: SContext, *, arg: str):
        msg = None
        try:
            msg = await ctx.send(f"Unloading cog **{arg}**...")
        except discord.HTTPException:
            pass

        try:
            ctx.bot.unload_extension(arg)
            if msg is not None:
                await msg.edit(content=f"Successfully unloaded cog **{arg}**.")
        except commands.ExtensionError as err:
            if msg is not None:
                await msg.edit(content=f"Failed to unload cog **{arg}**:\n{err.__class__.__name__}: {str(err)}")
            print("Manual cog {0!r} unload failed: {1}: {2}".format(arg, err.__class__.__name__, str(err)))

    @sdev_only()
    @cog.command(name="list", description="List cogs.")
    async def listcogs(self, ctx: SContext):
        await ctx.send("List of cogs:\n• {0}".format("\n• ".join(ctx.bot.extensions.keys())))


def setup(bot: commands.Bot) -> None:
    bot.add_cog(Dev(bot))
