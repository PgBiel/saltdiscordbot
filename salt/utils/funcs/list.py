from typing import TypeVar, Sequence, Union, Optional

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
