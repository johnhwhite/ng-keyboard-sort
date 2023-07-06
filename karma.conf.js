if (!process.env.CHROME_BIN) {
  const chromeBin = require('playwright-core').chromium.executablePath();
  if (chromeBin) {
    process.env.CHROME_BIN = chromeBin;
  }
}
if (!process.env.WEBKIT_BIN) {
  const webkitBin = require('playwright-core').webkit.executablePath();
  if (webkitBin) {
    process.env.WEBKIT_BIN = webkitBin;
  }
}
if (!process.env.WEBKIT_HEADLESS_BIN && process.env.WEBKIT_BIN) {
  process.env.WEBKIT_HEADLESS_BIN = process.env.WEBKIT_BIN;
}

module.exports = function (config, coverageDir) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('karma-chrome-launcher'),
      require(__dirname + '/scripts/karma-webkit-launcher.js'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: process.env.CI || false, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    coverageReporter: {
      dir: coverageDir,
      subdir: '.',
      reporters: process.env.CI
        ? [{ type: 'text' }, { type: 'text-summary' }]
        : [
            { type: 'html' },
            { type: 'json-summary' },
            { type: 'text' },
            { type: 'text-summary' },
            { type: 'lcov', subdir: 'lcov-report' },
          ],
      check: {
        global: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
    reporters: process.env.CI ? ['progress'] : ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: process.env.CI
      ? ['ChromeHeadlessCI', 'WebkitHeadless']
      : ['Chrome'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--disable-translate', '--disable-extensions', '--no-sandbox'],
      },
    },
    concurrency: process.env.CI ? 1 : Number.POSITIVE_INFINITY,
  });
};
