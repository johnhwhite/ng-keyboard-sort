module.exports = function (config, coverageDir) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('karma-chrome-launcher'),
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
    browsers: process.env.CI ? ['ChromeHeadlessCI'] : ['Chrome'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--disable-translate', '--disable-extensions', '--no-sandbox'],
      },
    },
    autoWatch: !process.env.CI,
    singleRun: !!process.env.CI,
    processKillTimeout: 10000,
    concurrency: process.env.CI ? 1 : Number.POSITIVE_INFINITY,
  });
};
