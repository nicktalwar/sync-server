var config = require('../config');
var assert = require('assert');
var ContactVerificationRequest = require('../../models/contactVerificationRequest');
var mongoose = require('../../lib/mongoose');

var clone = function(object) {
  return JSON.parse(JSON.stringify(object));
};

var contactVerificationRequestAttributes = {
  method: 'email',
  contact: 'example@example.com',
  code: '123456789',
  createUser: true,
  createSession: true,
  createNotificationRequests: [{
    event: 'Test'
  }],
  clientHost: 'http://example.com',
  verified: false
};

describe('new contactVerificationRequest', function() {
  before(function() {
    this.contactVerificationRequest = new ContactVerificationRequest(contactVerificationRequestAttributes);
  });

  it('has method', function() {
    assert.equal(this.contactVerificationRequest.method, contactVerificationRequestAttributes.method);
  });

  it('has contact', function() {
    assert.equal(this.contactVerificationRequest.contact, contactVerificationRequestAttributes.contact);
  });

  it('has code', function() {
    assert.equal(this.contactVerificationRequest.code, contactVerificationRequestAttributes.code);
  });

  it('has createUser', function() {
    assert.equal(this.contactVerificationRequest.createUser, contactVerificationRequestAttributes.createUser);
  });

  it('has createSession', function() {
    assert.equal(this.contactVerificationRequest.createSession, contactVerificationRequestAttributes.createSession);
  });

  it('has createNotificationRequests', function() {
    assert.equal(this.contactVerificationRequest.createNotificationRequests[0].event, contactVerificationRequestAttributes.createNotificationRequests[0].event);
  });

  it('has clientHost', function() {
    assert.equal(this.contactVerificationRequest.clientHost, contactVerificationRequestAttributes.clientHost);
  });

  it('has verified', function() {
    assert.equal(this.contactVerificationRequest.verified, contactVerificationRequestAttributes.verified);
  });

  it('can save and have id', function(done) {
    var contactVerificationRequest = this.contactVerificationRequest;
    this.contactVerificationRequest.save(function(error) {
      assert.equal(typeof contactVerificationRequest.id, 'string');
      done(error);
    });
  });

  it('can be found with findOrCreate', function(done) {
    var self = this;
    ContactVerificationRequest.findOrCreate(contactVerificationRequestAttributes, function(error, contactVerificationRequest) {
      assert.equal(contactVerificationRequest.id, self.contactVerificationRequest.id);
      done(error);
    });
  });

  it('can be created with findOrCreate', function(done) {
    var newContactVerificationRequestAttributes = clone(contactVerificationRequestAttributes);
    newContactVerificationRequestAttributes.method = 'phone';

    var self = this;
    ContactVerificationRequest.findOrCreate(newContactVerificationRequestAttributes, function(error, contactVerificationRequest) {
      assert.equal(typeof contactVerificationRequest.id, 'string');
      assert.notEqual(contactVerificationRequest.id, self.contactVerificationRequest.id);
      done(error);
    });
  });
  
  it('catches missing method value with validate static method', function(done) {
    var attributes = clone(contactVerificationRequestAttributes);
    delete attributes.method;

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Required method value missing');
        done();
      }
    });
  });

  it('catches invalid method value with validate static method', function(done) {
    var attributes = clone(contactVerificationRequestAttributes);
    attributes.method = 'balderdash';

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Invalid method value');
        done();
      }
    });
  });

  it('catches missing contact value with validate static method', function(done) {
    var attributes = clone(contactVerificationRequestAttributes);
    delete attributes.contact;

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Required contact value missing');
        done();
      }
    });
  });

  it('catches invalid contact value with validate static method', function(done) {
    var attributes = clone(contactVerificationRequestAttributes);
    attributes.contact = 'example@example';

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Invalid contact value');
        done();
      }
    });
  });

  it('catches invalid createUser value with validate static method', function(done) {
    var attributes = clone(contactVerificationRequestAttributes);
    attributes.createUser = 'apple';

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Invalid createUser value');
        done();
      }
    });
  });

  it('catches invalid createSession value with validate static method', function(done) {
    var attributes = clone(contactVerificationRequestAttributes);
    attributes.createSession = 'apple';

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Invalid createSession value');
        done();
      }
    });
  });

  it('catches invalid createNotificationRequests value with validate static method', function(done) {
    var attributes = clone(contactVerificationRequestAttributes);
    attributes.createNotificationRequests = 'apple';

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Invalid createNotificationRequests value');
        done();
      }
    });
  });

  it('catches invalid notificationRequest value with validate static method', function(done) {
    var attributes = clone(contactVerificationRequestAttributes);
    attributes.createNotificationRequests = ['apple'];

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Invalid notificationRequest value');
        done();
      }
    });
  });

  it('catches missing clientHost value with validate static method', function(done) {
    var attributes = clone(contactVerificationRequestAttributes);
    delete attributes.clientHost;

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Required clientHost value missing');
        done();
      }
    });
  });

  it('catches invalid clientHost value with validate static method', function(done) {
    var attributes = clone(contactVerificationRequestAttributes);
    attributes.clientHost = 3;

    ContactVerificationRequest.validate(attributes, function(errors, attributes) {
      if (!errors) {
        done(new Error('No errors returned by validate'));
      } else {
        assert.equal(errors[0].message, 'Invalid clientHost value');
        done();
      }
    });
  });

  it('filters out only unsupported values with validate static method', function(done) {
    var attributes = clone(contactVerificationRequestAttributes);
    attributes.foo = 'bar';

    ContactVerificationRequest.validate(attributes, function(errors, newAttributes) {
      assert.equal(newAttributes.method, attributes.method);
      assert.equal(newAttributes.contact, attributes.contact);
      assert.equal(newAttributes.code, attributes.code);
      assert.equal(newAttributes.createUser, attributes.createUser);
      assert.equal(newAttributes.createSession, attributes.createSession);
      assert.equal(newAttributes.createNotificationRequests[0].event, attributes.createNotificationRequests[0].event);
      assert.equal(newAttributes.clientHost, attributes.clientHost);
      assert.equal(typeof newAttributes.foo, 'undefined');
      done();
    });
  });
});