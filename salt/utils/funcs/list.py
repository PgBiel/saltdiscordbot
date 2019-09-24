import itertools
from typing import TypeVar, Sequence, Union, Optional, List, Tuple, overload, Iterator, Iterable

V = TypeVar("V")


def clean_nones_from_list(l: Sequence[Union[Optional[V], V]]) -> Sequence[V]:
    """
    Remove any None values from a list, or Sequence in general.
    :param l: The list or Sequence.
    :return: Cleaned list or Sequence.
    """
    return type(l)(itertools.filterfalse(lambda x: x is None, l))


U = TypeVar("U")


def clean_falsy_from_list(l: Sequence[Union[Optional[U], U]]) -> Sequence[U]:
    """
    Remove any falsy (0, None, False, empty list) from a list, or Sequence in general.

    :param l: The list or Sequence.
    :return: Cleaned list or Sequence.
    """
    if not any(l):
        return type(l)()
    return type(l)([el for el in l if el])


L = TypeVar("L")
N = TypeVar("N", Sequence, Sequence)
R = TypeVar("R")


@overload
def pagify_list(l: List[L], max_per_page: int = 10) -> List[List[L]]:
    pass


@overload
def pagify_list(l: Tuple[L], max_per_page: int = 10) -> Tuple[Tuple[L]]:
    pass


@overload
def pagify_list(l: Sequence[L], max_per_page: int = 10) -> Sequence[Sequence[L]]:
    pass


def pagify_list(l: Sequence[L], max_per_page: int = 10) -> Sequence[Sequence[L]]:
    """
    Pagify a list.

    :param l: List, tuple; sequence.
    :param max_per_page: Max amount per page.
    :return: The pagified list.
    """
    i = 0

    def key_func(x: L):
        nonlocal i
        res = i // max_per_page
        i += 1
        return res

    return type(l)([type(l)(el[1]) for el in itertools.groupby(l, key=key_func)])


def i_pagify_list(l: Iterable[L], max_per_page: int = 10) -> Iterator[Sequence[L]]:
    """
    Pagify an iterable, returning an iterator.

    :param l: Any iterable.
    :param max_per_page: Max amount per page.
    :return: The pagified iterable.
    """
    i = 0

    def key_func(x: L):
        nonlocal i
        res = i // max_per_page
        i += 1
        return res

    return (list(el[1]) for el in itertools.groupby(l, key=key_func))


@overload
def list_except(l: List[R], el: R) -> List[R]:
    pass


@overload
def list_except(l: Tuple[R], el: R) -> Tuple[R]:
    pass


def list_except(l: Sequence[R], el: R) -> Sequence[R]:
    """
    Exclude an element from a list.

    :param l: The list.
    :param el: The element to not include.
    :return: A list with all elements except the specified one.
    """
    if el in l:
        return type(l)(elm for elm in l if elm is not el)
    return l


def list_except_index(l: N, ind: int) -> N:
    """
    Exclude an index from a list.

    :param l: The list.
    :param ind: The index to exclude.
    :return: A list with all elements except the one at the specified index.
    """
    if ind is not None and 0 <= ind < len(l):
        return type(l)(l[i] for i in range(len(l)) if i != ind)
    return l
