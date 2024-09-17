/** @type {import('ts-jest').JestConfigWithTsJest} **/
/* eslint-env node */

module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}]
  }
}
