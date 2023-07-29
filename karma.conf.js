if (!process.env.WEBKIT_BIN) {
  const webkitBin = require('playwright-core').webkit.executablePath();
  if (webkitBin) {
    process.env.WEBKIT_BIN = webkitBin;
  }
}
if (!process.env.WEBKIT_HEADLESS_BIN && process.env.WEBKIT_BIN) {
  process.env.WEBKIT_HEADLESS_BIN = process.env.WEBKIT_BIN;
}

module.exports = function (config, coverageDir, isCi) {
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
      clearContext: isCi, // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    coverageReporter: {
      dir: coverageDir,
      subdir: '.',
      reporters: isCi
        ? [{ type: 'text' }]
        : [
            { type: 'html' },
            { type: 'json-summary' },
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
    reporters: isCi ? [] : ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: !isCi,
    browsers: isCi ? ['ChromeHeadlessCI', 'WebkitHeadless'] : ['Chrome'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--disable-translate', '--disable-extensions', '--no-sandbox'],
      },
    },
    singleRun: isCi,
    concurrency: isCi ? 1 : Number.POSITIVE_INFINITY,
    restartOnFileChange: !isCi,
    processKillTimeout: 10000,
  });
};
