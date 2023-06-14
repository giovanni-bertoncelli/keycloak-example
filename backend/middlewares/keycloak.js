const { Issuer } = require('openid-client');
const jose = require('jose')


class MemoryTTLCache {
  constructor() {
    this._cache = {};
    this._ttls = {};
  }

  get(key) {
    return this._cache[key];
  }

  set(key, value, ttl = 0) {
    clearTimeout(this._ttls[key]);
    this._cache[key] = value;

    if (ttl) {
      this._ttls[key] = setTimeout(
        this.clear.bind(this, key),
        ttl
      )
    }
  }

  clear(key) {
    clearTimeout(this._ttls[key]);
    delete this._cache[key];
    delete this._ttls[key];
  }
}

class KeycloakBearer {
  constructor({
    baseUrl,
    realm,
    clientId,
    clientSecret,
    excludeMethods = ['HEAD', 'OPTIONS'],
    audience,
    acceptedAlgorithms = ['RS256'],
    enableCache = false,
    cacheRetention = 15000
  }) {
    this.cache = new MemoryTTLCache();
    this.config = {
      baseUrl,
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
      this.config.baseUrl
    ).toString();
  }

  get issuer() {
    return this.oidcBaseUrl;
  }

  async setup() {
    this.oidcIssuer = await Issuer.discover(this.oidcBaseUrl);
    this.oidcClient = new this.oidcIssuer.Client({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    });
  }

  auth() {
    const fn = function authMw(req, res, next) {
      if (
        this.config.excludeMethods
          .includes(req.method.toUpperCase())
      ) {
        return next();
      }

      if (
        !req.headers['authorization'] ||
        !req.headers['authorization'].startsWith('Bearer ')
      ) {
        return next(new Error('Bearer missing or malformed!'))
      }

      const accessToken = req.headers['authorization']
        .replace('Bearer ', '');

      try {
        const decoded = this.decode(accessToken);
        // may throw
        const cacheKey = this.createCacheKey(decoded);
        const cached = this.cache.get(cacheKey);

        let verifyFn = null;

        // jwt already cached, proceed only with local validation
        if (cached && this.config.enableCache) {
          verifyFn = this.localVerify.bind(this);
        } else {
          verifyFn = this.remoteVerify.bind(this);
        }

        verifyFn.call(this, accessToken)
          .then((result) => {
            req.user = result;
            if (this.config.enableCache) {
              this.cache.set(
                cacheKey,
                true,
                this.config.cacheRetention
              );
            }
            // everything is ok, proceed
            return next();
          })
          .catch(e => next(e));
      } catch (e) {
        return next(e);
      }
    }
    return fn.bind(this);
  }

  decode(accessToken) {
    return jose.decodeJwt(accessToken);
  }

  async localVerify(accessToken) {
    const options = {
      issuer: this.issuer,
      audience: this.config.audience,
    }

    try {
      const JWKS = jose.createRemoteJWKSet(
        new URL(this.oidcIssuer.metadata.jwks_uri)
      );

      const { payload } = await jose.jwtVerify(
        accessToken,
        JWKS,
        options
      );
      return payload;
    } catch (e) {
      if (e && e.code === 'ERR_JWKS_MULTIPLE_MATCHING_KEYS') {
        for await (const publicKey of e) {
          try {
            const { payload } = await jose.jwtVerify(
              accessToken,
              publicKey,
              options
            );
            return payload;
          } catch (innerError) {
            if (innerError && innerError.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
              continue;
            }

            throw innerError;
          }
        }

        // no matching pks
        throw new jose.errors.JWSSignatureVerificationFailed()
      }

      throw e;
    }
  }

  async remoteVerify(accessToken) {
    const result = await this.oidcClient.introspect(
      accessToken
    );
    if (!result.active) {
      throw new Error('Access token does not result active!')
    }

    return result;
  }

  createCacheKey(jwtPayload) {
    const { jti, iss } = jwtPayload;

    if (!jti || !iss) {
      throw new Error('Unable to use jwt without jti or iss');
    }

    if (this.issuer !== iss) {
      throw new Error('Invalid issuer!');
    }

    return `${jti}@${iss}`;
  }
}


module.exports = KeycloakBearer;