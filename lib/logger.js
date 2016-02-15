var mongodb = require('../lib/mongodb')(true);
var util = require('util');
var winston = require('winston');
require('winston-mongodb').MongoDB;

if (!mongodb.url) {
  throw new Error('failed to determine mongodb url for logger. verify env variables');
}

var logger = new(winston.Logger)({
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    trace: 4
  },
  colors: {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    trace: 'white'
  },
  transports: [
    new winston.transports.Console({
      level: 'warn',
      colorize: true
    }),
    new winston.transports.File({
      level: 'trace',
      filename: 'logs/app.log',
      timestamp: true
    }),
    new winston.transports.MongoDB({
      level: 'trace',
      db: mongodb.url,
      timestamp: true
    })
  ]
});

module.exports = logger;