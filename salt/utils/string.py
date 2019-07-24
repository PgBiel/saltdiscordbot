def humanize_perm(perm: str) -> str:
    new_perm = str.replace("_", " ").replace("guild", "server")
    return new_perm.title()