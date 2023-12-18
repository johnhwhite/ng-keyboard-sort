import { VERSION as ANGULAR_VERSION } from '@angular/core';
import { minVersion } from 'semver';
import { readFileSync, writeFileSync } from 'node:fs';

const majorVersion = parseInt(ANGULAR_VERSION.major);
const packageJsonFile = 'libs/ng-keyboard-sort/package.json';

const packageJson = JSON.parse(readFileSync(packageJsonFile, 'utf8'));
const angularPeerDependencies = Object.keys(
  packageJson.peerDependencies || {}
).filter((dependency) => dependency?.startsWith('@angular/'));

if (
  angularPeerDependencies.some(
    (dependency) =>
      minVersion(packageJson.peerDependencies[dependency]).major !==
      majorVersion
  )
) {
  angularPeerDependencies.forEach((dependency) => {
    packageJson.peerDependencies[dependency] = `^${majorVersion}.0.0`;
  });
  writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2));
  console.info(`🆙 Updated ${packageJsonFile} to Angular ^${majorVersion}.0.0`);
}
