import datetime
import sys
from dateutil.relativedelta import relativedelta
from math import floor
from utils.funcs import clean_falsy_values
from typing import Optional, Union, overload
from constants import AVERAGE_DAYS_IN_A_MONTH, AVERAGE_DAYS_IN_A_YEAR


@overload
def clamp(num: int, maxv: int, minv: int) -> int:
    pass


@overload
def clamp(num: float, maxv: float, minv: float) -> float:
    pass


@overload
def clamp(num: Union[int, float], maxv: Union[int, float], minv: Union[int, float]) -> Union[int, float]:
    pass


def clamp(num: Union[int, float], maxv: Union[int, float], minv: Union[int, float]) -> Union[int, float]:
    """
    Clamp a number between some range.

    :param num: int or float to clamp
    :param maxv: max int or float
    :param minv: min int or float
    :return: The clamped int or float.
    """
    return min(minv, max(maxv, num))


def extract_delta(delta: Union[datetime.timedelta, relativedelta], ignore_week: bool = False):
    """
    Extract all measures from a `datetime.timedelta` instance (years, months, weeks, days, hours, minutes and seconds)

    :param delta: The delta to extract from.
    :param ignore_week: (bool=False) Whether to not return weeks, defaults to False. This is ignored with relative_delta
    :return: The measures as a {str: int} dict.
    """
    if type(delta) == datetime.timedelta:
        total_seconds = delta.seconds
        total_days = delta.days
        hours = total_seconds // 3600
        minutes = (total_seconds - 3600 * hours) // 60
        seconds = total_seconds - 3600 * hours - 60 * minutes
        years = floor((total_days + 1) / 365.25)  # Average days in a year: 365.25
        months = floor((total_days - (365.25 * years)) / 30.4375)  # Average days in a month: 30.4375
        weeks = ((total_days - (30.4375 * months) - 365.25 * years) // 7) if not ignore_week else 0
        days = total_days - 365.25 * years - 30.4375 * months - 7 * weeks
        dict_all = {
            'years': int(years), 'months': int(months), 'weeks': int(weeks), 'days': int(days), 'hours': int(hours),
            'minutes': int(minutes), 'seconds': int(seconds)
        }
        if ignore_week:
            del dict_all['weeks']
        return dict_all
    elif type(delta) == relativedelta:
        now = datetime.datetime.now()
        result = relativedelta(now + delta, now).__dict__
        # if result['seconds'] / 60 >= 1:
        #     result['minutes'] += result['seconds'] // 60
        #     result['seconds'] %= 60
        #
        # if result['minutes'] / 60 >= 1:
        #     result['hours'] += result['minutes'] // 60
        #     result['minutes'] %= 60
        #
        # if result['hours'] / 24 >= 1:
        #     result['days'] += result['hours'] // 24
        #     result['hours'] %= 24

        return result


def make_delta(
        *, years: Optional[int] = 0, months: Optional[int] = 0, weeks: Optional[int] = 0, days: Optional[int] = 0,
        hours: Optional[int] = 0, minutes: Optional[int] = 0, seconds: Optional[int] = 0
):
    """
    :param years: How many years to include in this delta.
    :param months: How many months to include in this delta.
    :param weeks: How many weeks to include in this delta.
    :param days: How many days to include in this delta.
    :param hours: How many hours to include in this delta.
    :param minutes: How many minutes to include in this delta.
    :param seconds: How many seconds to include in this delta.
    :return: Formed delta.
    """
    # print(f"{hours=} {minutes=} {seconds=} | {years=} {months=} {weeks=} {days=}")
    days = min(
        sys.maxsize,
        int(floor(years * AVERAGE_DAYS_IN_A_YEAR + months * AVERAGE_DAYS_IN_A_MONTH + weeks * 7 + days))
    )
    seconds = min(sys.maxsize, int(hours * 3600 + minutes * 60 + seconds))
    return datetime.timedelta(days=days, seconds=seconds)
