var base = require('../base');
var assert = require('assert');
var Source = require('../../models/source');
var ContentType = require('../../models/contentType');
var factory = require('../factory');

describe('new source', function() {
  before(function() {
    this.source = new Source(factory.sourceAttributes);
  });

  it('has id', function() {
    assert.equal(this.source.id, factory.sourceAttributes.id);
  });

  it('has name', function() {
    assert.equal(this.source.name, factory.sourceAttributes.name);
  });

  it('has enabled', function() {
    assert.equal(this.source.enabled, factory.sourceAttributes.enabled);
  });

  it('has logoGlyphPath', function() {
    assert.equal(this.source.logoGlyphPath, factory.sourceAttributes.logoGlyphPath);
  });

  it('has contentTypes', function() {
    assert.equal(this.source.contentTypes.length, factory.sourceAttributes.contentTypes.length);
  });

  it('has host', function() {
    assert.equal(this.source.host, factory.sourceAttributes.host);
  });

  it('has apiVersion', function() {
    assert.equal(this.source.apiVersion, factory.sourceAttributes.apiVersion);
  });

  it('has defaultItemsLimit', function() {
    assert.equal(this.source.defaultItemsLimit, factory.sourceAttributes.defaultItemsLimit);
  });

  it('has clientId', function() {
    assert.equal(this.source.clientId, factory.sourceAttributes.clientId);
  });

  it('has clientSecret', function() {
    assert.equal(this.source.clientSecret, factory.sourceAttributes.clientSecret);
  });

  it('has default defaultItemsLimit');
  it('has itemAssetLinks');
  it('has itemsRemotePath');
  it('has toObject');
});