EIGHT_BALL_ANSWERS = [
    "Very likely.",
    "Probably.",
    "Sure.",
    "Maybe.",
    "I wouldn't say so.",
    "Probably not.",
    "Very unlikely."
]

UPPER_EXPONENTS = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"]
UPPER_MAP = {str(i): UPPER_EXPONENTS[i] for i in range(0, len(UPPER_EXPONENTS))}
UPPER_MAP.update({"-": "⁻", "+": "⁺"})
