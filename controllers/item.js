require('../lib/prototypes/object');
var logger = require('../lib/logger');
var Status = require('../models/status');
var Item = require('../models/item');
var UserSourceAuth = require('../models/userSourceAuth');
var UserStorageAuth = require('../models/userStorageAuth');
var https = require('https');
var async = require('async');
var fs = require('fs');
var mime = require('mime-types');

var mediaTypeFromPath = function(path) {
  var mediaType = mime.lookup(path);
  if (!mediaType) { throw new Error('unable to determine media type from path') }
  return mediaType;
}

var requestPut = function(stringBody, options, done) {
  var request = https.request(options, function(response) {
    var responseBody = '';

    response.on('data', function(chunk) {
      responseBody += chunk;
    });

    response.on('end', function() {
      return done(null, {
        statusCode: response.statusCode,
        body: JSON.parse(responseBody)
      });
    });
  }).on('error', function(error) {
    return done(error);
  });

  request.write(stringBody);
  request.end();
}

var storageRequestError = function(storage, statusCode) {
  var errorMessage = 'failed request (status code ' + statusCode + ')';

  if (storage.requestErrorMessage !== 'undefined') {
    var storageErrorMessage = storage.requestErrorMessage(statusCode);

    if (storageErrorMessage) {
      return new Error(errorMessage + ': ' + storageErrorMessage);
    } else {
      return new Error(errorMessage); 
    }
  } else {
    return new Error(errorMessage); 
  }
};

module.exports = {
  syncAllForAllContentTypes: function(app, user, storage, source) {
    var self = this;

    try {
      logger.info('started to sync all items for all content types', {
        userId: user.id,
        storageId: storage.id,
        sourceId: source.id
      });

      source.contentTypes.forEach(function(contentType) {
        self.syncAll(app, user, storage, source, contentType);
      });
    } catch (error) {
      logger.error('failed to sync all items for all content types', {
        userId: user.id,
        storageId: storage.id,
        sourceId: source.id,
        error: error
      });
    }
  },

  syncAll: function(app, user, storage, source, contentType) {
    var self = this;

    logger.info('started to sync all items', {
      userId: user.id,
      storageId: storage.id,
      sourceId: source.id,
      contentTypeId: contentType.id
    });

    var syncPage = function myself(error, pagination) {
      if (error) {
        logger.error('failed to sync page of items', {
          userId: user.id,
          storageId: storage.id,
          sourceId: source.id,
          contentTypeId: contentType.id,
          error: error
        });
      } else {
        self.syncPage(app, user, storage, source, contentType, pagination, myself);
      }
    }

    syncPage(null, { offset: 0 });
  },

  syncPage: function(app, user, storage, source, contentType, pagination, callback) {
    var self = this;

    try {
      logger.trace('started to sync page of items', { 
        userId: user.id,
        storageId: storage.id,
        sourceId: source.id,
        contentTypeId: contentType.id,
        pagination: pagination
      });

      Status.findOrCreate({
        userId: user.id,
        storageId: storage.id,
        sourceId: source.id,
        contentTypeId: contentType.id
      }, function(error, status) {
        if (error) {
          logger.error('failed to find or create status while syncing page of items', {
            userId: user.id,
            storageId: storage.id,
            sourceId: source.id,
            contentTypeId: contentType.id,
            pagination: pagination
          });

          return callback(error);
        }
           
        UserSourceAuth.findOne({
          userId: user.id,
          sourceId: source.id
        }, function(error, userSourceAuth) {
          if (error || !userSourceAuth) {
            logger.error('failed to find userSourceAuth while syncing page of items', {
              userId: user.id,
              storageId: storage.id,
              sourceId: source.id,
              contentTypeId: contentType.id,
              pagination: pagination,
              error: error
            });

            if (!error) {
              error = new Error('failed to find userSourceAuth while syncing page of items');
            }

            return callback(error);
          }

          var path = source.itemsPagePath(contentType, userSourceAuth, pagination);

          if (!path) {
            return;
          }

          var url = 'https://' + source.host + path;

          self.getFile(url, function(error, data) {
            if (error) {
              var error = new Error('failed to retrieve page of items to sync');

              logger.error(error.message, {
                userId: user.id,
                storageId: storage.id,
                sourceId: source.id,
                contentTypeId: contentType.id,
                pagination: pagination,
                error: error
              });

              return callback(error);
            } else {
              try {
                var dataJSON = JSON.parse(data);
                
                if (typeof dataJSON.meta.errorType != 'undefined') {
                  var error = new Error('failed to retrieve valid page of items to sync');
                  
                  logger.error(error.message, {
                    userId: user.id,
                    storageId: storage.id,
                    sourceId: source.id,
                    contentTypeId: contentType.id,
                    pagination: pagination,
                    errorType: dataJSON.meta.errorType,
                    errorDetail: dataJSON.meta.errorDetail,
                    errorType: dataJSON.meta.errorType
                  });

                  return callback(error);
                }

                if (typeof dataJSON.response !== 'undefined') {
                  var itemsJSON = dataJSON.response[contentType.pluralId].items;
                } else if (typeof dataJSON.data !== 'undefined') {
                  var itemsJSON = dataJSON.data;
                }
                
                logger.trace('parsed page of items to sync', {
                  userId: user.id,
                  storageId: storage.id,
                  sourceId: source.id,
                  contentTypeId: contentType.id,
                  pagination: pagination,
                  total: itemsJSON.length
                });

                if (pagination.offset == 0) {
                  if (typeof dataJSON.response !== 'undefined') {
                    status.totalItemsAvailable = dataJSON.response[contentType.pluralId].count;
                  }

                  status.save();
                }

                if (itemsJSON.length != 0) {
                  var syncItem = function(itemJSON, callback) {
                    try {
                      self.syncItem(app, user, storage, source, contentType, itemJSON, callback);
                    } catch (error) {
                      callback(error);
                    }
                  }

                  var offset = pagination.offset;

                  async.each(itemsJSON, syncItem, function(error) {
                    var pagination = {
                      offset: offset + itemsJSON.length
                    };

                    if (typeof dataJSON.pagination !== 'undefined') {
                      if (typeof dataJSON.pagination.next_url !== 'undefined') {
                        pagination.next_url = dataJSON.pagination.next_url;
                      }

                      if (typeof dataJSON.pagination.next_max_id !== 'undefined') {
                        pagination.next_max_id = dataJSON.pagination.next_max_id;
                      }
                    }

                    callback(null, pagination);
                  });
                } else {
                  logger.trace('found no items to sync in page', { 
                    userId: user.id,
                    storageId: storage.id,
                    sourceId: source.id,
                    contentTypeId: contentType.id,
                    pagination: pagination
                  });
                }
              } catch(error) {
                logger.error('failed to sync page of items', {
                  error: error,
                  userId: user.id,
                  storageId: storage.id,
                  sourceId: source.id,
                  contentTypeId: contentType.id,
                  pagination: pagination
                });
              }
            }
          })
        });
      });
    } catch (error) {
      logger.error('failed to sync page of items', {
        userId: user.id,
        storageId: storage.id,
        sourceId: source.id,
        contentTypeId: contentType.id,
        pagination: pagination,
        error: error
      });
    }
  },

  syncItem: function(app, user, storage, source, contentType, itemJSON, callback) {
    var self = this;

    if (typeof source.isValidItemJSON !== 'undefined' && !source.isValidItemJSON(itemJSON, contentType)) {
      return callback();
    }

    logger.trace('started to sync item', {
      userId: user.id,
      storageId: storage.id,
      sourceId: source.id,
      contentTypeId: contentType.id,
      sourceItemId: itemJSON.id
    });

    Item.findOrCreate({
      userId: user.id,
      storageId: storage.id,
      sourceId: source.id,
      contentTypeId: contentType.id,
      sourceItemId: itemJSON.id
    }, function(error, item) {
      if (error) {
        logger.error('failed to find or create item while syncing', { 
          error: error
        });

        callback(error);
      } else {
        if (item.syncVerifiedAt) {
          logger.trace('skipped syncing item because it is already verified', {
            userId: user.id,
            storageId: storage.id,
            sourceId: source.id,
            contentTypeId: contentType.id,
            sourceItemId: item.sourceItemId,
            item_id: item.id
          });

          callback();
        } else {
          item.data = itemJSON;
          item.description = source.itemDescription(item);
          item.syncAttemptedAt = Date.now();
          item.save(function(error) {
            if (error) {
              logger.error('failed to save item while syncing', {
                userId: user.id,
                storageId: storage.id,
                sourceId: source.id,
                contentTypeId: contentType.id,
                sourceItemId: item.sourceItemId,
                item_id: item.id,
                error: error
              });

              callback(error);
            } else {
              self.storeItem(app, user, storage, source, contentType, item, callback);
            }
          });
        }
      }
    });
  },

  storeItem: function(app, user, storage, source, contentType, item, callback) {
    var self = this;

    logger.trace('started to store item', {
      userId: user.id,
      storageId: storage.id,
      sourceId: source.id,
      contentTypeId: contentType.id,
      item_id: item.id
    });

    var storeCallback = function(error, response) {
      if (error) {
        logger.error('failed to store item', { 
          userId: user.id,
          storageId: storage.id,
          sourceId: source.id,
          contentTypeId: contentType.id,
          item_id: item.id,
          message: error.message
        });

        item.syncFailedAt = Date.now();
        item.error = error.message;
        item.save(function(saveError) {
          if (saveError) {
            logger.error('failed to update item after failure to store it', {
              userId: user.id,
              storageId: storage.id,
              sourceId: source.id,
              contentTypeId: contentType.id,
              item_id: item.id,
              error: saveError 
            });
          }

          return callback(error);
        });
      }

      try {
        response = JSON.parse(JSON.stringify(response));
      } catch(error) {
        logger.error('failed to parse store item response', { response: response });
        return callback(error);
      }

      logger.trace('stored item', { 
        userId: user.id,
        storageId: storage.id,
        sourceId: source.id,
        contentTypeId: contentType.id,
        item_id: item.id,
        response: response
      });

      item.syncVerifiedAt = Date.now();
      item.bytes = response.bytes;
      item.path = response.path;
      item.save(function(error) {
        if (error) {
          logger.error('failed to update item after storing it', {
            userId: user.id,
            storageId: storage.id,
            sourceId: source.id,
            contentTypeId: contentType.id,
            item_id: item.id,
            error: error
          });

          callback(error);
        } else {
          app.emit('itemSyncVerified', item);

          logger.trace('updated item after storing it', {
            userId: user.id,
            storageId: storage.id,
            sourceId: source.id,
            contentTypeId: contentType.id,
            item_id: item.id
          });

          callback();
        }
      });
    };

    var path = '/' + contentType.pluralId + '/raw-synced-meta/' + item.id + '.json';
    this.storeFile(user, storage, path, item.data, 'utf8', storeCallback);

    if (typeof source.itemAssetLinks !== 'undefined') {
      for (var key in source.itemAssetLinks) {
        var url = Object.valueByString(item.data, source.itemAssetLinks[key]);
        var extension = url.split('.').pop();

        this.getFile(url, function(error, data) {
          if (error) {
            logger.error('failed to get item asset', {
              item_id: item.id,
              asset_url: url
            });

            callback(error);
          } else {
            var path = '/' + contentType.pluralId + '/' + item.id + '.' + extension;
            self.storeFile(user, storage, path, data, 'binary', function(error, response) {
              if (error) {
                logger.error('failed to store item asset', {
                  item_id: item.id,
                  asset_url: url
                });
              } else {
                logger.trace('stored item asset', {
                  item_id: item.id,
                  asset_key: key,
                  asset_url: url
                });
              }
            });
          }
        });
      }
    }
  },

  getFile: function(url, callback) {
    var extension = url.split('.').pop();
    var parsedUrl = require('url').parse(url);
    var contentType;

    if (extension == 'jpg') {
      contentType = 'image/jpeg';
    } else {
      contentType = 'application/json';
    }

    https.get({
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      headers: {
        'Content-Type': contentType
      }
    }, function(res) {
      if (res.statusCode != 200) {
        logger.error('failed to get file with status code 200', {
          url: url
        });

        return callback(new Error('failed to get file'));
      }

      var data = '';

      if (extension == 'jpg') {
        res.setEncoding('binary');
      }

      res.on('data', function(chunk) {
        data += chunk;
      });

      res.on('end', function() {
        callback(null, data);
      });
    }).on('error', function(error) {
      logger.error('failed to get file', {
        error: error,
        url: url
      });

      callback(error);
    });
  },

  storeFile: function(user, storage, subpath, body, done) {
    async.waterfall([
      // Check body type
      function(done) {
        if (typeof body !== 'string') {
          done(new Error('body needs to be string to store file'));
        } else {
          done();
        }
      },
      // Get userStorageAuth
      function(done) {
        UserStorageAuth.findOne({
          storageId: storage.id,
          userId: user.id
        }, done);
      },
      // PUT request to storage
      function(userStorageAuth, done) {
        if (!userStorageAuth) { return done(new Error('failed to retrieve userStorageAuth')); }

        requestPut(body, {
          host: storage.host,
          path: storage.storeFilePath(userStorageAuth, subpath),
          method: 'PUT',
          headers: { 
            'Content-Type': mediaTypeFromPath(subpath),
            'Content-Length': body.length
          }
        }, done);
      },
      // Parse response from storage
      function(response, done) {
        if (response.statusCode !== 200) {
          done(storageRequestError(storage, response.statusCode));
        } else {
          done(null, response.body);
        }
      }
    ], function(error, responseBody) {
      if (error) {
        logger.error(error.message, {
          userId: user.id,
          storageId: storage.id,
          subpath: subpath,
          error: error
        });

        if (typeof done !== 'undefined') {
          done(error);
        } else {
          throw error;
        }
      } else if(typeof done !== 'undefined') {
        done(null, responseBody);
      }
    });
  }
}