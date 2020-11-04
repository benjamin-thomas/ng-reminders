// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-notify-reporter'),
      require('karma-spec-reporter'), // npm install karma-spec-reporter --save-dev
      require('karma-mocha-reporter') // npm install karma-mocha-reporter --save-dev
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage/ng-reminders'),
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    reporters: ['progress', 'kjhtml', 'notify', 'spec', 'mocha'],
    // notifyReporter: {
    //   reportEachFailure: true, // Default: false, Will notify on every failed spec
    //   reportSuccess: false, // Default: true, Will notify when a suite was successful
    //   reportBackToSuccess: true, // Default: true, Will notify when a suite was back to successful
    // },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
