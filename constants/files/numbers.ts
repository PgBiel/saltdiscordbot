export default {
  max: {
    PROMPT: 5,
    CASES: (members: number = 0) => {
      if (members >= 3000) {
        return 2000;
      } else if (members >= 700) {
        return 1000;
      } else {
        return 500;
      }
    },
    length: {
      PAGE: 5
    },
    chars: {
      FIELD: 1024,
      DESC: 2048,
      MSG: 2000
    }
  },
  pagination: {
    super: {
      SKIP: 5,
      DIVIDE_BY: 4,
      SPECIALS: [null, null, 1, 2, 2, 3, 4]
    }
  }
};
