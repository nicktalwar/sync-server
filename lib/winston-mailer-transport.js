var util = require('util');
var winston = require('winston');
var mailer = require('./mailer');

var transport = function(options) {
  this.name = 'mailerLogger';
  this.level = (options && options.level) ? options.level : 'warn';
};

util.inherits(transport, winston.Transport);

transport.prototype.log = function(level, msg, meta, callback) {
  if (process.env.SYNC_MAILER_LOGGER_EMAIL) {
    mailer.sendMail({
      to: process.env.SYNC_MAILER_LOGGER_EMAIL,
      subject: process.env.SYNC_NAME + ' event: ' + msg,
      text: msg + '\n\n' + JSON.stringify(meta)
    }, function(error, res) {
      callback(error, true);
    });
  }
};

module.exports = transport;