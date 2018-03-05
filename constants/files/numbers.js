module.exports = {
  MAX_PROMPT: 5,
  MAX_CASES: (members = 0) => {
    if (members >= 5000) {
      return 2000;
    } else if (members >= 700) {
      return 1000;
    } else {
      return 500;
    }
  },
  MAX_FIELD_CHARS: 1024,
  MAX_DESC_CHARS: 2048,
  MAX_MSG_CHARS: 2000,
  MAX_PAGE_LENGTH: 5
};