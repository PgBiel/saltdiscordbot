import asyncio
from salt import Salt

async def run(bot: Salt):
  try:
    await bot.run()
  except KeyboardInterrupt:
    await bot.logout()

def exec_run():
  loop = asyncio.get_event_loop()
  loop.run_until_complete(run(Salt()))


if __name__ == '__main__':
  exec_run()