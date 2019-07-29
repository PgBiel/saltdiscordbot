import datetime
from math import floor
from utils.funcs import clean_falsy_values


def extract_delta(delta: datetime.timedelta):
    """
    Extract all measures from a `datetime.timedelta` instance (years, months, weeks, days, hours, minutes and seconds)
    :param delta: The delta to extract from.
    :return: The measures as a {str: int} dict.
    """
    total_seconds = delta.seconds
    total_days = delta.days
    hours = total_seconds // 3600
    minutes = (total_seconds - 3600 * hours) // 60
    seconds = total_seconds - 3600 * hours - 60 * minutes
    years = floor(total_days / 365.25)  # Average days in a year: 365.25
    months = floor((total_days - (365.25 * years)) / 30.4375)  # Average days in a month: 30.4375
    weeks = (total_days - (30.4375 * months) - 365.25 * years) // 7
    days = total_days - 365.25 * years - 30.4375 * months - 7 * weeks
    dict_all = {
        'years': int(years), 'months': int(months), 'weeks': int(weeks), 'days': int(days), 'hours': int(hours),
        'minutes': int(minutes), 'seconds': int(seconds)
    }
    return dict_all
