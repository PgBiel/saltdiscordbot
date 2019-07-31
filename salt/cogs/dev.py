import discord
import asyncio
import ast
import re
import inspect, dis
import typing
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
    return """
```py
{0}
{1}
{2}
```""".format(f"Input\n{inp}" if inp else "", bottom_text, result)


def source(func: typing.Callable) -> str:
    return inspect.getsource(func)


def multiline_eval(expr: str, global_vals, local_vals, *, update_locals: bool = False):
    """
    Eval a multiline string.
    :param expr: The string to eval.
    :param global_vals: The global vars.
    :param local_vals: The local vars.
    :param update_locals: If should update locals and globals.
    :return:
    :raise: MultilineEvalNoLastExprValue - when attempting to eval an expression.
    """

    def run(func, arg):
        return func(compile(arg, '/dev/null', ('exec' if func == exec else 'eval')), global_vals, local_vals)

    global_vals["_locs"] = local_vals
    global_vals["_globs"] = global_vals
    tree = ast.parse(expr)
    update_tree = ast.parse("_locs.update(locals());_globs.update(globals())")
    update_to_add = update_tree.body
    if update_locals and len(tree.body) > 1:
        for i in range(len(tree.body)):
            next_i = i + 1
            tree.body[next_i:next_i] = update_to_add

    ast_eval_expr = tree.body[-1]
    eval_expr = ast.Expression(ast_eval_expr.value) if hasattr(ast_eval_expr, "value") else None
    exec_expr = ast.Module(tree.body[:-1], type_ignores=[])
    run(exec, exec_expr)
    if eval_expr is not None:
        eval_mode = "eval"
        if update_locals and isinstance(ast_eval_expr, ast.Assign):
            last_name: ast.Name = ast_eval_expr.targets[-1]
            if isinstance(last_name, ast.Tuple):
                last_name = last_name.elts[-1]
            return_var_name = ast.Name(
                "_return_var", lineno=last_name.lineno, col_offset=last_name.col_offset + 4, ctx=last_name.ctx
            )
            ast_eval_expr.targets.append(return_var_name)
            new_body = [ast_eval_expr] + update_to_add
            my_module = ast.Module(new_body, type_ignores=[])
            run(exec, my_module)
            return local_vals['_return_var']
        return run(eval, eval_expr)
    else:
        new_module = ast.Module([ast_eval_expr], type_ignores=[])
        if update_locals:
            new_module.body.extend(update_to_add)
        run(exec, new_module)
        raise MultilineEvalNoLastExprValue


class Dev(commands.Cog):
    @sdev_only()
    @scommand(name='eval', pass_context=True, description="Just testing", hidden=True)
    async def eval(self, ctx: SContext, *, arg: str) -> None:
        # arg = arg.strip("`")
        regex_code_block = r'^(```[a-zA-Z]*)([\s\S]+)(```)$'
        if re.fullmatch(regex_code_block, arg):
            arg = re.sub(regex_code_block, r"\2", arg)
        arg = arg.strip()
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
            await ctx.send(out_str, deletable=True)  # TODO: Work on Repl and Sudo

    @sdev_only()
    @scommand(name='repl', pass_context=True, description="Just testing", hidden=True)
    async def repl(self, ctx: SContext) -> None:
        # arg = arg.strip("`")

        new_globals = globals().copy()
        new_globals["self"] = self
        new_globals["ctx"] = ctx
        new_locals = locals().copy()

        async def run_eval(arg: str):
            regex_code_block = r'^(```[a-zA-Z]*)([\s\S]+)(```)$'
            if re.fullmatch(regex_code_block, arg):
                arg = re.sub(regex_code_block, r"\2", arg)
            arg = arg.strip()
            result = None
            success = None
            coro = False
            try:
                new_locals.update(locals())
                result = multiline_eval(arg, new_globals, new_locals, update_locals=True)
                success = True
            except MultilineEvalNoLastExprValue as e:
                result = "(No value)"
                success = True
            except (SyntaxError, NameError):
                raise
            except Exception as err:  # pylint: disable=broad-except
                result = err
                success = False

            if is_awaitable(result) and success:
                coro = True
                first_out_str = eval_text(ctx, "", "[Coroutine, awaiting...]", not success, False)
                msg_sent: discord.Message = await ctx.send(first_out_str, deletable=True)
                try:
                    result = await result
                    success = True
                except Exception as err:
                    result = err
                    success = False
                second_out_str = eval_text(ctx, "", result, not success, True)
                await msg_sent.edit(content=second_out_str)
            else:
                out_str = eval_text(ctx, "", result, not success, False)
                await ctx.send(out_str, deletable=True)

        await ctx.send("Now entering Repl mode.")
        try:
            while True:
                received: discord.Message = await ctx.bot.wait_for(
                    "message", timeout=60, check=lambda x: x.author == ctx.author and x.channel == ctx.channel
                )
                if received.content == 'exit':
                    await ctx.send("Exiting Repl mode.")
                    break
                try:
                    await run_eval(received.content)
                except (SyntaxError, NameError):
                    pass
        except asyncio.TimeoutError:
            await ctx.send("Leaving Repl mode after 60 seconds of inactivity.")

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
