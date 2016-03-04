var pluralize = require('pluralize');
var prototype = require('../lib/prototypes/array');
var prototype = require('../lib/prototypes/string');

module.exports = function ContentType(attributes) {
  if (typeof attributes === 'undefined') {
    throw Error('attributes parameter not provided');
  }

  if (typeof attributes !== 'object') {
    throw Error('attributes parameter not object');
  }

  if (!attributes.id) {
    throw Error('attributes.id not found');
  }

  this.id = attributes.id;
  this.pluralId = pluralize(this.id);
  this.name = this.id.capitalizeFirstLetter();
  this.pluralName = this.pluralId.capitalizeFirstLetter();

  this.toObject = function(sources) {
    var sourceIds;
    var self = this;

    if (typeof sources !== 'undefined' && sources.length > 0) {
      sourceIds = sources.map(function(source) {
        var sourceObject = source.toObject();
        if (sourceObject.contentTypes && sourceObject.contentTypes.indexOf(self.id) > -1) {
          return sourceObject.id;
        }
      }).clean();
    }

    return {
      id: this.id,
      pluralId: this.pluralId,
      name: this.name,
      pluralName: this.pluralName,
      sourceIds: sourceIds
    };
  };
}