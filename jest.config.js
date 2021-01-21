module.exports = {
  setupFiles: [
    "./test/jestOverrides.js"
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: false,
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
};