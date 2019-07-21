import asyncio
from salt import Salt

def run(bot: Salt) -> None:
  bot.run()

if __name__ == '__main__':
  run(Salt())