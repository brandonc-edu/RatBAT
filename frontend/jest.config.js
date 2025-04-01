// filepath: /home/yadavi1/RatBAT/frontend/jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest"
  },
  transformIgnorePatterns: ["node_modules/(?!(axios)/)"], // Ensure axios is transformed
  extensionsToTreatAsEsm: [".ts", ".tsx", ".js", ".jsx"]
};
