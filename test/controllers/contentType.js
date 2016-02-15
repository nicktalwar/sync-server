var base = require('../base');
var assert = require('assert');
var ContentTypeController = require('../../controllers/contentType');
var contentTypeConfig = require('../../config/contentType');

describe('contentType controller', function() {
  it('has toObject', function() {
    var contentTypeObjects = ContentTypeController.contentTypeObjects();
    var contentTypeIds = contentTypeConfig.contentTypeIds.sort();

    var contentTypeObjectIds = contentTypeObjects.map(function(contentTypeObject) {
      return contentTypeObject.id
    }).sort();

    for (var i = 0; i < contentTypeIds.length; i++) {
      assert.equal(contentTypeObjectIds[i], contentTypeIds[i]);
    }
  });
});