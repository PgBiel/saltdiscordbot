import discord
from typing import Iterable, TypeVar, Optional, List, Tuple

T = TypeVar("T")
def search_in_group(text: str, group: Iterable[T], *attrs) -> Optional[Tuple[T]]:
    found: List[T] = []
    for el in group:
        if el in