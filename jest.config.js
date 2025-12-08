/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.js'],
  moduleFileExtensions: ['js'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  verbose: true
}

module.exports = config
