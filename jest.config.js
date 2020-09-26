module.exports = {
  setupFiles: [
    "./test/jestOverrides.js"
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },
};