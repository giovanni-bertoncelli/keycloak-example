const ApiGateway = require('moleculer-web');
const KeycloakBearer = require('../middlewares/keycloak');

const keycloak = new KeycloakBearer({
  baseUrl: 'http://localhost:8081/',
  clientId: 'backend-test',
  clientSecret: 'ZbLOUKgtUn0w2gjqX9z0Jthb11UuDnDi',
  audience: 'backend-test',
  realm: 'localrealm',
})

module.exports = {
  name: 'api',
  mixins: [ApiGateway],
  settings: {
    port: 3000,
    authentication: false,
    authorization: false,
    use: [
      keycloak.auth()
    ],
    cors: {
      origin: "http://localhost:4200",
      methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
      credentials: true,
      maxAge: 3600
    },
    routes: [{
      path: "/api",
      aliases: {
        'GET hello': 'api.hello'
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
  },
  async stopped() {
  }
};