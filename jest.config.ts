export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",

  roots: ["<rootDir>/tests"],

  testMatch: ["**/*.test.ts"],      // <-- importante

  moduleFileExtensions: ["ts", "js", "json"],
  
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "esnext",
          moduleResolution: "bundler",
        }
      }
    ]
  }
};
