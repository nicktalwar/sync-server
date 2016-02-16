module.exports = {
  id: 'dropbox',
  host: 'content.dropboxapi.com',

  storeFilePath: function(userStorageAuth, subpath) {
    if (!subpath) {
      throw Error('subpath needed to generate dropbox storage storeFilePath');
    }

    if (!userStorageAuth || !userStorageAuth.storageToken) {
      throw Error('userStorageAuth with storageToken needed to generate dropbox storage storeFilePath');
    }

    return '/1/files_put/sandbox/' + subpath + '?overwrite=false&access_token=' + userStorageAuth.storageToken;
  }
};