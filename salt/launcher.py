"""
Launches Salt bot.
"""
import asyncio
from salt import Salt

def run(bot: Salt) -> None:
  """
  Run it!
  """
  bot.run()

if __name__ == '__main__':
  run(Salt())