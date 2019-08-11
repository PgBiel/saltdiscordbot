import threading
import time
import asyncio
import typing
import functools
from utils.funcs import salt_loop

# Credit: https://stackoverflow.com/a/40965385/7781690


class RepeatedTimer:
    """
    Repeat an action over time.
    """
    def __init__(
            self, *, interval: float, function: typing.Callable,
            args: typing.Optional[typing.Sequence] = None, kwargs: typing.Optional[dict] = None,
            loop: typing.Optional[asyncio.AbstractEventLoop] = None
    ):
        """
        Initialize the RepeatedTimer.

        :param interval: Amount of seconds after which to repeat the action.
        :param function: Function to execute on every repeat.
        :param args: Args to pass to function. (Tuple)
        :param kwargs: Kwargs to pass to function. (Dict)
        """
        self._timer = None
        self.interval = interval
        self.function = function
        self.args = args or tuple()
        self.kwargs = kwargs or dict()
        self.loop = loop or salt_loop
        self.is_running = False
        self.next_call = time.time()
        self.start()

    def _run(self):
        self.is_running = False
        self.start()
        if asyncio.iscoroutinefunction(self.function):
            self.loop.create_task(self.function(*self.args, **self.kwargs))
        else:
            self.function(*self.args, **self.kwargs)

    def start(self):
        if not self.is_running:
            self.next_call += self.interval
            self._timer = threading.Timer(self.next_call - time.time(), self._run)
            self._timer.start()
            self.is_running = True

    def stop(self):
        self._timer.cancel()
        self.is_running = False
