var base = require('../base');
var assert = require('assert');
var Item = require('../../models/item');
var mongoose = require('../../lib/mongoose');
var factory = require('../factory');

describe('new item', function() {
  before(base.clearDatabase);

  before(function(done) {
    var self = this;
    factory.user(function(error, user) {
      self.user = user;
      done(error);
    });
  });

  before(function() {
    this.storage = factory.storage;
  });

  before(function() {
    this.source = factory.source;
  });

  before(function() {
    this.contentType = factory.contentType;
  });

  before(function() {
    var itemAttributes = factory.itemAttributes;
    itemAttributes.userId = this.user.id;
    itemAttributes.storageId = this.storage.id;
    itemAttributes.sourceId = this.source.id;
    itemAttributes.contentTypeId = this.contentType.id;
    this.item = new Item(itemAttributes);
  });

  it('has userId', function() {
    assert.equal(this.item.userId, factory.itemAttributes.userId);
  });

  it('has storageId', function() {
    assert.equal(this.item.storageId, factory.itemAttributes.storageId);
  });

  it('has sourceId', function() {
    assert.equal(this.item.sourceId, factory.itemAttributes.sourceId);
  });

  it('has sourceItemId', function() {
    assert.equal(this.item.sourceItemId, factory.itemAttributes.sourceItemId);
  });

  it('has contentTypeId', function() {
    assert.equal(this.item.contentTypeId, factory.itemAttributes.contentTypeId);
  });

  it('has syncAttemptedAt', function() {
    assert.equal(this.item.syncAttemptedAt, factory.itemAttributes.syncAttemptedAt);
  });

  it('has syncVerifiedAt', function() {
    assert.equal(this.item.syncVerifiedAt, factory.itemAttributes.syncVerifiedAt);
  });

  it('has syncFailedAt', function() {
    assert.equal(this.item.syncFailedAt, factory.itemAttributes.syncFailedAt);
  });

  it('has bytes', function() {
    assert.equal(this.item.bytes, factory.itemAttributes.bytes);
  });

  it('has path', function() {
    assert.equal(this.item.path, factory.itemAttributes.path);
  });

  it('has description', function() {
    assert.equal(this.item.description, factory.itemAttributes.description);
  });

  it('has error', function() {
    assert.equal(this.item.error, factory.itemAttributes.error);
  });

  it('has data', function() {
    assert.equal(this.item.data, factory.itemAttributes.data);
  });

  it('can save and have id', function(done) {
    var item = this.item;
    this.item.save(function(error) {
      assert.equal(typeof item.id, 'string');
      done(error);
    });
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    Item.findOrCreate(factory.itemAttributes, function(error, item) {
      assert.equal(item.id, self.item.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var newItemAttributes = factory.itemAttributes;
    newItemAttributes.userId = 'newItemUserId';

    var self = this;
    Item.findOrCreate(newItemAttributes, function(error, item) {
      assert.equal(typeof item.id, 'string');
      assert.notEqual(item.id, self.item.id);
      done(error);
    });
  });

  it('fails creation without mimeType');
  it('fails creation with invalid storageId');
  it('fails creation with invalid sourceId');
  it('fails creation with invalid contentTypeId');
});