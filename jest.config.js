module.exports = {
  verbose: true,
  collectCoverage: false,
  coverageReporters: ['json', 'html'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};
