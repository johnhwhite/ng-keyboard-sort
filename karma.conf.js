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
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    coverageReporter: {
      dir: __dirname + '/coverage/' + coverageDir,
      subdir: '.',
      reporters: [
        { type: 'text' },
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
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'Chrome',
        flags: [
          '--disable-extensions',
          '--disable-gpu',
          '--disable-translate',
          '--headless=new',
        ],
      },
    },
    restartOnFileChange: true,
    browsers: ['Chrome'],
  });
};
