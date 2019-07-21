import asyncio
from salt import Salt

def run(bot: Salt):
  bot.run()

if __name__ == '__main__':
  run(Salt())