module.exports = function(attributes) {
  if (typeof attributes !== 'object') {
    throw Error('attributes parameter not object');
  }

  if (!attributes.id) {
    throw Error('attributes.id not found');
  }

  return require('../objects/storages/' + attributes.id);
}