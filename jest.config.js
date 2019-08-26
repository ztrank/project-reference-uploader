module.exports = {
    testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
    roots: [
        "./spec"
    ],
    transform: {
        "^.+\\.ts?$": "ts-jest"
    },
    collectCoverage: true,
    coverageReporters: ['html']
}