"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = {
    UNIQUE_CONSTRAINT: "SequelizeUniqueConstraintError",
};
exports.times = {
    AMBIGUITY_EXPIRE: 30000,
};
exports.regex = {
    HAS_DECIMAL: /\.(?!0+$)/,
    BAN_MATCH: (isUser) => {
        if (isUser) {
            return /^([^]+?(?:#\d{4})?)\s+[^]*$/;
        }
        else {
            return /^[^]+?(?:#\d{4})?\s+([^]*)$/;
        }
    },
};
exports.numbers = {
    MAX_PROMPT: 5,
};
