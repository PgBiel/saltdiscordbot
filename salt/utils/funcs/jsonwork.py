"""
Work with JSON.
"""
import json


def load(file_path: str) -> dict:
  with open(file_path, encoding="utf-8", mode="r") as file_stream:
    data = json.load(file_stream)

  return data
