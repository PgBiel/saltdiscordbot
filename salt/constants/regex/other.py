AMBIGUITY_TWO_DIGITS = r'^(\d{2}|\d{1})\.?$'
AMBIGUITY_CANCEL = PROMPT_CANCEL = r'^`*cancel`*$'
PROMPT_SKIP = r'^`*skip`*$'
PROMPT_CONFIRMATION = r'^`*(y|yes|ok|n|no|nah)`*$'

SUPEXPONENT_REGEX = r'(?P<op>\*\*|[ˆ^])\s*(?P<content>[+-]?\d+|\((?:[+-]?\s*\d+\s*)+\))'
