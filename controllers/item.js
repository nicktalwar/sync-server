require('../lib/prototypes/object');
var logger = require('../lib/logger');
var Status = require('../models/status');
var Item = require('../models/item');
var UserSourceAuth = require('../models/userSourceAuth');
var UserStorageAuth = require('../models/userStorageAuth');
var https = require('https');
var async = require('async');
var fs = require('fs');

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

  storeFile: function(user, storage, path, data, encoding, callback) {
    var extension = path.split('.').pop();
    var contentType;

    if (extension === 'jpg') {
      contentType = 'image/jpeg';
    } else {
      contentType = 'application/json';
    }

    UserStorageAuth.findOne({
      storageId: storage.id,
      userId:    user.id
    }, function(error, userStorageAuth) {
      if (error || !userStorageAuth) {
        logger.warn('failed to retrieve userStorageAuth for user while storing file', {
          userId: user.id,
          storageId: storage.id,
          error: error
        });
        return callback(error);
      }

      if (encoding === 'binary') {
        fs.writeFile('/Users/markhendrickson/Desktop/binary/1.jpg', data, 'binary', function(error) {
          if (error) { 
            logger.error('failed to write binary file to disk');
          } else {
            logger.trace('wrote binary file to disk');
          }
        });
      }

      var options = {
        host: storage.host,
        path: storage.path(userStorageAuth, path),
        method: 'PUT',
        headers: {
          'Content-Type': contentType
        }
      };

      try {
        var req = https.request(options, function(res) {
          if (res.statusCode == 401) {
            return callback(new Error('unauthorized request'));
          }

          var data = '';

          res.on('data', function(chunk) {
            data += chunk;
          });

          res.on('end', function() {
            callback(null, data);
          });
        }).on('error', function(error) {
          return callback(error);
        });

        if (encoding === 'utf8') {
          data = JSON.stringify(data);
        }

        req.write(data);
        req.end();
      } catch (error) {
        return callback(error);
      }
    });
  }
}