export let sql = {
  UNIQUE_CONSTRAINT: "SequelizeUniqueConstraintError",
};

export let times = {
  AMBIGUITY_EXPIRE: 30000,
};

export let regex = {
  HAS_DECIMAL: /\.(?!0+$)/,
  BAN_MATCH: (isUser: boolean) => {
    if (isUser) {
      return /^([^]+?(?:#\d{4})?)\s+[^]*$/;
    } else {
      return /^[^]+?(?:#\d{4})?\s+([^]*)$/;
    }
  },
};

export let numbers = {
  MAX_PROMPT: 5,
};
