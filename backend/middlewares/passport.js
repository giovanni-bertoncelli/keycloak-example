const { Issuer } = require("openid-client");
const { Strategy } = require('passport-http-bearer');

class OpenIDPassportStrategy {
  constructor({
    authServerUrl,
    realm,
    clientId,
    clientSecret,
    excludeMethods = ['HEAD', 'OPTIONS'],
    audience,
    acceptedAlgorithms = ['RS256'],
    enableCache = false,
    cacheRetention = 15000
  }) {
    this.config = {
      authServerUrl,
      realm,
      clientId,
      clientSecret,
      excludeMethods: excludeMethods.map(m => m.toUpperCase()),
      audience,
      acceptedAlgorithms,
      enableCache,
      cacheRetention
    }
  }

  get oidcBaseUrl() {
    return new URL(
      `/auth/realms/${this.config.realm}`,
      this.config.authServerUrl
    ).toString();
  }

  async setup() {
    this.oidcIssuer = await Issuer.discover(this.oidcBaseUrl);
    this.oidcClient = new this.oidcIssuer.Client({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    });
  }

  strategy() {
    return new Strategy(
      (token, done) => {
        this.oidcClient.introspect(
          token
        ).then((result) => {
          if (!result.active) {
            return done(new Error('Access token does not result active!'));
          }

          return done(null, result);
        }).catch(e => {
          return done(e);
        });
      }
    )
  }
}

module.exports = OpenIDPassportStrategy;