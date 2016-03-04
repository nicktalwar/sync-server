module.exports = function(attributes) {
  if (typeof attributes === 'undefined' || !attributes) {
    throw Error('attributes parameter not provided');
  }

  if (typeof attributes !== 'object') {
    throw Error('attributes parameter not object');
  }

  if (typeof attributes !== 'object') {
    throw Error('attributes parameter not object');
  }

  if (!attributes.id) {
    throw Error('attributes.id not provided');
  }

  try {
    return require('../objects/storages/' + attributes.id);
  } catch(error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error('invalid storage ID provided');
    } else {
      throw error;
    }
  }
}