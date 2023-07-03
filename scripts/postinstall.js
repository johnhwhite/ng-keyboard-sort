const fs = require('fs');

const playwrightVersion = require(__dirname +
  '/../node_modules/playwright-core/package.json').version;
const ciWorkflow = fs.readFileSync(
  __dirname + '/../.github/workflows/ci.yml',
  'utf8'
);

const playwrightContainer = 'image: mcr.microsoft.com/playwright:v';
const playwrightContainerStart = ciWorkflow.indexOf(playwrightContainer);
if (playwrightContainerStart === -1) {
  console.error('Could not find the Playwright container in the CI workflow');
  process.exit(1);
}

const playwrightContainerEnd = ciWorkflow.indexOf(
  '-',
  playwrightContainerStart
);
if (playwrightContainerEnd === -1) {
  console.error(
    'Could not find the end of the Playwright container in the CI workflow'
  );
  process.exit(1);
}

const playwrightContainerLine = ciWorkflow.substring(
  playwrightContainerStart,
  playwrightContainerEnd
);
const playwrightCIVersion = playwrightContainerLine.substring(
  playwrightContainer.length
);
if (!playwrightCIVersion.match(/^\d+\.\d+\.\d+$/)) {
  console.error(
    'Could not find the Playwright version in the CI workflow: ' +
      playwrightCIVersion
  );
  process.exit(1);
}
if (playwrightContainerLine !== playwrightContainer + playwrightVersion) {
  const newCIWorkflow = ciWorkflow.replace(
    playwrightContainerLine,
    playwrightContainer + playwrightVersion
  );
  fs.writeFileSync(
    __dirname + '/../.github/workflows/ci.yml',
    newCIWorkflow,
    'utf8'
  );
}
