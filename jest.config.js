export default {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",

    roots: ["<rootDir>/tests"],

    testMatch: ["**/*.test.ts"],

    moduleFileExtensions: ["ts", "js", "json"],

    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },

    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                useESM: true,
                tsconfig: {
                    module: "esnext",
                    moduleResolution: "bundler",
                },
            },
        ],
    },
};
