var base = require('../base');
var assert = require('chai').assert;
var testConfig = require('../../config/test');

describe('test config', function() {
  it('has database', function() {
    assert.isString(testConfig.database);
    assert.isAbove(testConfig.database.length, 0);
  });
});