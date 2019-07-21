import os
import discord
import traceback
import sys
from discord.ext import commands
from utils.jsonwork import load as json_load

description = """
Salt Bot, moderation, administration, utility and fun all in one!
"""

cogs_ext_list = (
  "cogs.test"
)
class Salt(commands.Bot):
  def __init__(self):
    super().__init__(command_prefix=self.prefix, description=description)
    self.config = dict()
    self.make_config()
    for cog_ext in cogs_ext_list:
      try:
        self.load_extension(cog_ext)
      except Exception as _err:
        print(f'Failed to load extension {cog_ext}.', file=sys.stderr)
        traceback.print_exc()
  
  def prefix(self, msg: discord.Message):
    # ctx = self.get_context(msg)
    user_id = self.user.id
    member_ping_prefix = '<@!{0}> '.format(user_id)
    ping_prefix = '<@{0}> '.format(user_id)
    prefixes = [ping_prefix, member_ping_prefix]
    prefixes.append('+') # gonna wait until later to add per-guild prefix
    return prefixes
  
  def run(self):
    super().run(self.config.token)

  def make_config(self):
    parsed_config = json_load("../config.json")
    self.config = parsed_config