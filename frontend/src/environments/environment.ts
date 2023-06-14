// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  keycloak: {
    "realm": "localrealm",
    "auth-server-url": "http://localhost:8081/auth/",
    "ssl-required": "external",
    "resource": "angular-test",
    "public-client": true,
    "verify-token-audience": true,
    "use-resource-role-mappings": true,
    "confidential-port": 0
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
