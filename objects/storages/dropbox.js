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
  },

  requestErrorMessage: function(statusCode) {
    switch (statusCode) {
      case 409: 
        return "The call failed because a conflict occurred. This means a file already existed at the specified path, overwrite was false, and the parent_rev (if specified) didn't match the current rev.";
      case 411:
        return "Missing Content-Length header (this endpoint doesn't support HTTP chunked transfer encoding)."
      default:
        return;
    }
  }
};