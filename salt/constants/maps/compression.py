DELTA_COMPRESSION_MAP = dict(
    years="Y",
    months="M",
    weeks="W",
    days="D",
    hours="h",
    minutes="m",
    seconds="s",
    milliseconds="n",
    microseconds="u"
)
DELTA_DECOMPRESSION_MAP = {v: k for k, v in DELTA_COMPRESSION_MAP.items()}  # "Y": "years" ...
