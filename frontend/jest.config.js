module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  transform: {
    "^.+\\.[tj]sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "ecmascript",
            jsx: true
          },
          target: "es2020"
        },
        module: {
          type: "commonjs"
        }
      }
    ]
  },
  // Ensure axios is transformed too. On Windows, this regex often works better:
  transformIgnorePatterns: [
    "node_modules/(?!axios)"
  ]
};
