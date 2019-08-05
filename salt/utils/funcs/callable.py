import asyncio
import inspect
from typing import Callable, Coroutine, TypeVar, Union, Any
from utils.funcs import salt_loop

R = TypeVar("R")


def is_awaitable(possible_coro: Any) -> bool:
    # return asyncio.iscoroutine(possible_coro) or asyncio.isfuture(possible_coro)
    return inspect.isawaitable(possible_coro)  # generators should return False


async def run_or_await(func: Callable[..., Union[R, Coroutine[Any, Any, R]]], *args, **kwargs) -> R:
    ran = func(*args, **kwargs)
    if is_awaitable(ran):
        ran = await ran
    return ran

J = TypeVar("J")


async def await_if_needed(res: Union[Coroutine[Any, Any, J], J]) -> J:
    if is_awaitable(res):
        res = await res
    return res

S = TypeVar("S")


def sync_await(coro_or_future: Coroutine[Any, Any, S]) -> S:
    if asyncio.isfuture(coro_or_future):
        return asyncio.futures._get_loop(coro_or_future).run_until_complete(coro_or_future)
    else:
        return salt_loop.run_until_complete(coro_or_future)
