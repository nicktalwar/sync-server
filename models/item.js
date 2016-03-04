var logger = require('../lib/logger');
var mongoose = require('../lib/mongoose');
var ContentType = require('./contentType');
var mime = require('mime-types');
  
var itemSchema = mongoose.Schema({
  userId: { type: String, required: 'userId required' },
  storageId: { type: String, required: 'storageId required' },
  sourceId: { type: String, required: 'sourceId required' },
  sourceItemId: String,
  contentTypeId: { type: String, required: 'contentTypeId required' },
  syncAttemptedAt: Date,
  syncVerifiedAt: Date,
  syncFailedAt: Date,
  bytes: Number,
  description: String,
  error: String,
  data: String,
  mimeType: { type: String, required: 'mimeType required' }
});

itemSchema.set('toObject', { getters: true });
itemSchema.options.toObject.transform = mongoose.transform;

itemSchema.statics.findOrCreate = function(attributes, callback) {
  _this = this;
  logger.trace('finding or creating item', { attributes: attributes });

  this.findOne(attributes, function(error, item) {
    if (item) {
      logger.trace('found item', { id: item.id });
      callback(error, item);
    } else {
      _this.create(attributes, function(error, item) {
        if (error) {
          logger.error('failed to create new item', { error: error.message });
        } else {
          logger.trace('created new item', { id: item.id });
        }
        
        callback(error, item);
      });
    }
  });
};

itemSchema.virtual('extension').get(function() {
  return mime.extension(this.mimeType);
});

itemSchema.virtual('path').get(function() {
  return (this.id && this.contentTypeId && this.sourceId) ? '/' + this.contentTypeId + '/' + this.sourceId + '/' + this.id + '.' + this.extension : null;
});

module.exports = mongoose.model('Item', itemSchema);