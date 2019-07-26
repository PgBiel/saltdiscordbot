import asyncio
from typing import Callable, Coroutine, TypeVar, Union, Any

R = TypeVar("R")


def is_awaitable(possible_coro: Any) -> bool:
    return asyncio.iscoroutine(possible_coro) or asyncio.isfuture(possible_coro)


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
