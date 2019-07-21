from discord.ext import commands

class SContext(commands.Context):
  """
  For typing purposes. This is our customization of the Context
  """
  def __init__(self, **attrs):
    super(**attrs)

  # @property
  # def deletable() -> bool:
  #   pass