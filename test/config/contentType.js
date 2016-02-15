var base = require('../base');
var assert = require('chai').assert;
var contentTypeConfig = require('../../config/contentType');

describe('contentType config', function() {
  it('has contentTypeIds', function() {
    var contentTypeIds = contentTypeConfig.contentTypeIds.filter(Boolean);
    assert.isAbove(contentTypeIds.length, 0);
  });
});