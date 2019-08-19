from typing import TypeVar, Sequence, Union, Optional, List, Tuple, overload

V = TypeVar("V")


def clean_nones_from_list(l: Sequence[Union[Optional[V], V]]) -> Sequence[V]:
    """
    Remove any None values from a list, or Sequence in general.
    :param l: The list or Sequence.
    :return: Cleaned list or Sequence.
    """
    new_list = []
    for el in l:
        if el is not None:
            new_list.append(el)
    return type(l)(new_list)  # works with tuples too


U = TypeVar("U")


def clean_falsy_from_list(l: Sequence[Union[Optional[U], U]]) -> Sequence[U]:
    """
    Remove any falsy (0, None, False, empty list) from a list, or Sequence in general.

    :param l: The list or Sequence.
    :return: Cleaned list or Sequence.
    """
    if not any(l):
        return type(l)()
    new_list = []
    for el in l:
        if el:
            new_list.append(el)
    return type(l)(new_list)


L = TypeVar("L")
N = TypeVar("N", Sequence, Sequence)
R = TypeVar("R")


@overload
def pagify_list(l: List[L], max_per_page: int = 10) -> List[List[L]]:
    pass


@overload
def pagify_list(l: Tuple[L], max_per_page: int = 10) -> Tuple[List[L]]:
    pass


def pagify_list(l: Sequence[L], max_per_page: int = 10) -> Sequence[List[L]]:
    """
    Pagify a list.

    :param l: List.
    :param max_per_page: Max amount per page.
    :return: The pagified list.
    """
    if not l or len(l) < 1:
        return type(l)() if l else []

    new_list = [[]]
    for i in range(len(l)):
        new_list[-1].append(l[i])
        if len(new_list[-1]) % max_per_page == 0 and i + 1 != len(l):  # reached max amnt per page
            new_list.append([])

    return type(l)(new_list)


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
