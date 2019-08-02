"""
Launches Salt bot.
"""
import asyncio
from salt import Salt
from utils.funcs import asyncproc
from multiprocessing import Pool


def run(bot: Salt) -> None:
    """
    Run it!
    """
    bot.run()


if __name__ == '__main__':
    run(Salt())
