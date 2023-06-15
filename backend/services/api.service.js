const ApiGateway = require('moleculer-web');
const KeycloakBearer = require('../middlewares/keycloak');
const config = require('../keycloak.json')
const passport = require('passport');
const OpenIDPassportStrategy = require('../middlewares/passport');
const session = require('express-session')

// 1. custom middleware
const keycloakConfig = {
  authServerUrl: config['auth-server-url'],
  clientId: config.resource,
  clientSecret: config.credentials.secret,
  audience: config.resource,
  realm: config.realm,
}
const keycloak = new KeycloakBearer(keycloakConfig)


// 2. openid-client passport strategy
const oidc = new OpenIDPassportStrategy(keycloakConfig);

module.exports = {
  name: 'api',
  mixins: [ApiGateway],
  settings: {
    port: 3000,
    authentication: false,
    authorization: false,
    use: [
      // keycloak.auth()
      session({ secret: 'blabla' }),
      passport.initialize(),
    ],
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
      credentials: false,
      maxAge: 3600000
    },
    routes: [{
      path: "/api",
      aliases: {
        'GET hello'(req, res) {
          passport.authenticate('bearer')(req, res, () => {
            res.end('hello!')
          });
        }
      },
      whitelist: [
        "*.*"
      ],
      onBeforeCall(ctx, route, req, res) {
        // Set request headers to context meta
        ctx.meta.$requestHeaders = req.headers;
      },
    }]
  },
  actions: {
    hello: {
      handler(ctx) {
        console.log(ctx.meta.$requestHeaders);
        return { hello: 'world' }
      }
    }
  },
  events: {
  },
  methods: {},
  async created() {
  },
  async started() {
    await keycloak.setup();
    await oidc.setup();
    passport.use('bearer', oidc.strategy());
    passport.serializeUser(function (user, cb) {
      process.nextTick(function () {
        return cb(null, {
          ...user
        });
      });
    });

    passport.deserializeUser(function (user, cb) {
      process.nextTick(function () {
        return cb(null, user);
      });
    });
  },
  async stopped() {
  }
};