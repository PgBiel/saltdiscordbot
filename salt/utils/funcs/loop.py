import asyncio
import nest_asyncio

loop = asyncio.new_event_loop()
nest_asyncio.apply(loop=loop)
