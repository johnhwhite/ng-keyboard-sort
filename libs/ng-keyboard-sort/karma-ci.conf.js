module.exports = function (config) {
  require('../../karma.conf')(
    config,
    require('path').join(__dirname, '../../coverage/ng-keyboard-sort'),
    true
  );
};
