var base = require('../base');
var assert = require('assert');
var ContentType = require('../../models/contentType.js');
var Source = require('../../models/source.js');
var factory = require('../factory');

describe('new contentType', function() {
  describe('initiated with attributes parameter', function() {
    before(function() {
      this.contentType = new ContentType(factory.contentTypeAttributes);
    });

    it('has id', function() {
      assert.equal(this.contentType.id, factory.contentTypeAttributes.id);
    });

    it('has pluralId', function() {
      assert.equal(this.contentType.pluralId, 'widgets');
    });

    it('has name', function() {
      assert.equal(this.contentType.name, 'Widget');
    });

    it('has pluralName', function() {
      assert.equal(this.contentType.pluralName, 'Widgets');
    });

    it('has toObject', function() {
      var object = this.contentType.toObject();
      assert.equal(object.id, 'widget');
      assert.equal(object.pluralId, 'widgets');
      assert.equal(object.name, 'Widget');
      assert.equal(object.pluralName, 'Widgets');
      assert.equal(object.sourceIds, null);
    });

    describe('and assigned sources', function() {
      before(function() {
        var contentType2 = new ContentType({ id: 'gizmo' });
        this.sources = [
          new Source({id: 'alpha'}),
          new Source({id: 'beta', contentTypes: [this.contentType, contentType2]}),
          new Source({id: 'gamma', contentTypes: [contentType2]})
        ];
      });

      it('has toObject with correct sourceId', function() {
        var object = this.contentType.toObject(this.sources);
        assert.equal(object.sourceIds.length, 1);
        assert.equal(object.sourceIds[0], 'beta');
      });
    });
  });

  describe('initiated without attributes parameter', function() {
    before(function() {
      try {
        this.contentType = new ContentType();
      } catch(error) {
        this.error = error;
      }
    });

    it('fails creation', function() {
      assert.equal(this.error.message, 'attributes parameter not provided');
    });
  });

  describe('initiated with non-object attributes parameter', function() {
    before(function() {
      try {
        this.contentType = new ContentType('widget');
      } catch(error) {
        this.error = error;
      }
    });

    it('fails creation', function() {
      assert.equal(this.error.message, 'attributes parameter not object');
    });
  });

  describe('initiated without ID attribute', function() {
    before(function() {
      try {
        this.contentType = new ContentType({foo: 'bar'});
      } catch(error) {
        this.error = error;
      }
    });

    it('fails creation', function() {
      assert.equal(this.error.message, 'attributes.id not found');
    });
  });
});