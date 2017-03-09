var assert = require('assert');
var supertest = require('supertest');

module.exports = function(app) {
  var responseDocumentHasError = function(responseDocument, error) {
    if (!responseDocument.errors) {
      return false;
    }

    var hasError = false;

    responseDocument.errors.forEach((responseDocumentError) => {
      if (responseDocumentError.title === error.message) {
        hasError = true;
      }
    });

    return hasError;
  };

  return {
    assertRoute: function(Model, method, tests) {
      tests.forEach((test) => {
        var description = method + ' requests to ' + Model.modelName;
        var Test = supertest(app)[method]('/' + Model.modelType());

        if (test.requestBody) {
          Test.send(test.requestBody);
        }

        if (test.status) {
          description += ' respond with status ' + test.status;
          Test.expect(test.status);
        }

        if (test.error) {
          description += ' and error';
        }

        if (test.when) {
          description += ' when ' + test.when;
        }

        it(description, (done) => {
          Test.end((error, res) => {
            if (error) {
              return done(new Error(`${error.message}.\n\nRequest body: ${JSON.stringify(test.requestBody)}.\n\nResponse body: ${JSON.stringify(res.body)}`));
            }

            if (test.error) {
              try {
                assert(responseDocumentHasError(res.body, test.error));
              } catch (error) {
                if (error.name === 'AssertionError') {
                  if (res.body.errors) {
                    error.message = `Error not included in response: ${JSON.stringify(res.body.errors)} does not contain "${test.error.message}"`;
                  } else {
                    error.message = `Error not included in response: "${test.error.message}"`;
                  }
                }

                throw error;
              }
            }

            done();
          });
        });
      });
    }
  };
};