import { minVersion, satisfies } from 'semver';
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const packageJsonFile = 'libs/ng-keyboard-sort/package.json';

const dependencies = JSON.parse(execSync('npm ls --json').toString());
const packageJson = JSON.parse(readFileSync(packageJsonFile, 'utf8'));
const peerDependencies = Object.keys(packageJson.peerDependencies || {});

if (
  peerDependencies.some(
    (dependency) =>
      !satisfies(
        minVersion(packageJson.peerDependencies[dependency]),
        `^${dependencies.dependencies[dependency].version}`
      )
  )
) {
  peerDependencies.forEach((dependency) => {
    packageJson.peerDependencies[dependency] =
      `^${dependencies.dependencies[dependency].version}`;
  });
  writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2) + `\n`);
  console.info(`🆙 Updated ${packageJsonFile} to latest versions`);
}
