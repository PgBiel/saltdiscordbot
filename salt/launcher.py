import asyncio
from salt import Salt

def run(bot):
  try:
    await bot.run()
  except KeyboardInterrupt:
    await bot.logout()

if __name__ == '__main__':
  run()