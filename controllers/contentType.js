var ContentType = require('../models/contentType');

module.exports = {
  contentTypeObjects: function(sources) {
    var contentTypeIds = require('../config/contentType').contentTypeIds;

    var contentTypeObjects = [];
    contentTypeIds.forEach(function(contentTypeId) {
      contentTypeObjects.push(new ContentType(contentTypeId).toObject(sources));
    });

    return contentTypeObjects;
  }
};