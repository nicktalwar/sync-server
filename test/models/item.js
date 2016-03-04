var base = require('../base');
var assert = require('assert');
var Item = require('../../models/item');
var mongoose = require('../../lib/mongoose');
var factory = require('../factory');

describe('new item', function() {
  var attributes;
  before(base.clearDatabase);

  before(function(done) {
    var self = this;
    factory.user(function(error, user) {
      self.user = user;
      done(error);
    });
  });

  before(function() {
    this.storage = factory.storage();
  });

  before(function() {
    this.source = factory.source();
  });

  before(function() {
    this.contentType = factory.contentType();
  });

  before(function() {
    attributes = factory.itemAttributes;
    attributes.userId = this.user.id;
    attributes.storageId = this.storage.id;
    attributes.sourceId = this.source.id;
    attributes.contentTypeId = this.contentType.id;
  });

  describe('with complete attributes', function() {
    before(function() {
      this.item = new Item(attributes);
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
      assert.equal(typeof this.item.path, 'string');
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
  });

  describe('without mimeType', function() {
    before(function(done) {
      this.mimeType = attributes['mimeType'];
      delete attributes['mimeType'];

      var self = this;
      Item.create(attributes, function(error, item) {
        self.error = error;
        done();
      });
    });

    it('fails creation', function() {
      assert.equal(this.error.message, 'Validation failed');
      assert.equal(this.error.errors.mimeType.message, 'mimeType required');
    });

    after(function() {
      attributes.mimeType = this.mimeType;
    });
  });

  describe('without userId', function() {
    before(function(done) {
      this.userId = attributes['userId'];
      delete attributes['userId'];

      var self = this;
      Item.create(attributes, function(error, item) {
        self.error = error;
        done();
      });
    });

    it('fails creation', function() {
      assert.equal(this.error.message, 'Validation failed');
      assert.equal(this.error.errors.userId.message, 'userId required');
    });

    after(function() {
      attributes.userId = this.mimeType;
    });
  });

  describe('without storageId', function() {
    before(function(done) {
      this.storageId = attributes['storageId'];
      delete attributes['storageId'];

      var self = this;
      Item.create(attributes, function(error, item) {
        self.error = error;
        done();
      });
    });

    it('fails creation', function() {
      assert.equal(this.error.message, 'Validation failed');
      assert.equal(this.error.errors.storageId.message, 'storageId required');
    });

    after(function() {
      attributes.storageId = this.mimeType;
    });
  });

  describe('without sourceId', function() {
    before(function(done) {
      this.sourceId = attributes['sourceId'];
      delete attributes['sourceId'];

      var self = this;
      Item.create(attributes, function(error, item) {
        self.error = error;
        done();
      });
    });

    it('fails creation', function() {
      assert.equal(this.error.message, 'Validation failed');
      assert.equal(this.error.errors.sourceId.message, 'sourceId required');
    });

    after(function() {
      attributes.sourceId = this.mimeType;
    });
  });

  describe('without contentTypeId', function() {
    before(function(done) {
      this.contentTypeId = attributes['contentTypeId'];
      delete attributes['contentTypeId'];

      var self = this;
      Item.create(attributes, function(error, item) {
        self.error = error;
        done();
      });
    });

    it('fails creation', function() {
      assert.equal(this.error.message, 'Validation failed');
      assert.equal(this.error.errors.contentTypeId.message, 'contentTypeId required');
    });

    after(function() {
      attributes.contentTypeId = this.mimeType;
    });
  });
});