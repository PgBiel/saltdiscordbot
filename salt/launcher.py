import asyncio
from salt import Salt

async def run(bot: Salt):
  try:
    await bot.run()
  except KeyboardInterrupt:
    await bot.logout()

if __name__ == '__main__':
  run(Salt())