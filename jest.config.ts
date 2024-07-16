import { JestConfigWithTsJest, pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

const jestConfig: JestConfigWithTsJest = {
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  moduleFileExtensions: ["js", "json", "ts"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
  modulePaths: [compilerOptions.baseUrl],
  preset: "ts-jest",
  rootDir: "./",
  testEnvironment: "node",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  }
};

export default jestConfig;
