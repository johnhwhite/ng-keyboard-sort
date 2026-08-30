import { minVersion, satisfies, inc } from 'semver';
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { argv } from 'node:process';

const packageJsonFile = 'libs/ng-keyboard-sort/package.json';

const dependencies = JSON.parse(execSync('npm ls --json').toString());
const packageJson = JSON.parse(readFileSync(packageJsonFile, 'utf8'));
const peerDependencies = Object.keys(packageJson.peerDependencies || {});

let needsUpdate = peerDependencies.some(
  (dependency) =>
    !satisfies(
      minVersion(packageJson.peerDependencies[dependency]),
      `^${dependencies.dependencies[dependency].version}`
    )
);
needsUpdate ||=
  argv.includes('--next') &&
  peerDependencies.some(
    (dependency) =>
      !satisfies(
        inc(
          dependencies.dependencies[dependency].version,
          'premajor',
          null,
          'alpha',
          '0'
        ),
        packageJson.peerDependencies[dependency]
      )
  );
if (needsUpdate) {
  peerDependencies.forEach((dependency) => {
    let version = `^${dependencies.dependencies[dependency].version}`;
    if (argv.includes('--next') && dependency.startsWith('@angular/')) {
      version += ` || ^${inc(
        dependencies.dependencies[dependency].version,
        'premajor',
        null,
        'alpha',
        '0'
      )}`;
    }
    packageJson.peerDependencies[dependency] = version;
  });
  writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2) + `\n`);
  console.info(`🆙 Updated ${packageJsonFile} to latest versions`);
}
