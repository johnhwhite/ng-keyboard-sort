const {
  runCommand,
} = require('@angular/cli/src/command-builder/command-runner');
const { createConsoleLogger } = require('@angular-devkit/core/node');

runCommand(['test', '-c', 'ci'], createConsoleLogger())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
