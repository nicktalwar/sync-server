module.exports = function(attributes) {
  this.id                   = attributes.id,
  this.name                 = attributes.name,
  this.enabled              = attributes.enabled,
  this.logoGlyphPath        = attributes.logoGlyphPath,
  this.contentTypes         = attributes.contentTypes,
  this.host                 = attributes.host,
  this.apiVersion           = attributes.apiVersion;
  this.defaultItemsLimit    = typeof attributes.defaultItemsLimit !== 'undefined' ? attributes.defaultItemsLimit : 250;
  this.clientId             = attributes.clientId;
  this.clientSecret         = attributes.clientSecret;
  this.consumerKey          = attributes.consumerKey;
  this.consumerSecret       = attributes.consumerSecret;
  this.itemAssetLinks       = attributes.itemAssetLinks;

  this.itemsRemotePath = function(contentType, userSourceAuth, offset) {
    return;
  };

  this.toObject = function(userSourceAuths) {
    var contentTypeIds;
    var self = this;

    if (typeof this.contentTypes !== 'undefined') {
      contentTypeIds = this.contentTypes.map(function(contentType) {
        return contentType.id;
      });
    }

    var userSourceAuthIds;

    if (typeof userSourceAuths !== 'undefined') {
      userSourceAuthIds = userSourceAuths.map(function(userSourceAuth) {
        if (userSourceAuth.source == self.id) {
          return userSourceAuth.id;
        }
      })

      userSourceAuthIds = userSourceAuthIds.filter(function(n) { return n != undefined });
    }

    return {
      id: this.id,
      name: this.name,
      enabled: this.enabled,
      logoGlyphPath: this.logoGlyphPath,
      contentTypes: contentTypeIds,
      userSourceAuths: userSourceAuthIds
    };
  };
}