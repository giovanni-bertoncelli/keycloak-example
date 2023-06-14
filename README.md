## Example with KeyCloak

### Configurazione Keycloak

- Creare un client pubblico per il frontend con PKCE (https://www.analyticsvidhya.com/blog/2022/06/spring-security-oauth2-with-keycloak-pkce-authorization-code-flow/), non dovrebbe avere un secret
- Salva la configurazione OIDC JSON all'interno di `environment.keycloak`
- Creare un ruolo all'interno del client
- Creare un client confidential per il backend, questo client è bearer-only e non dovrebbe abilitare nessun flow di autenticazione ma dovrebbe avere un secret
- Creare un ruolo all'interno del client
- Salva la configurazione OIDC JSON all'interno di `keycloak.json`
- Creare un ruolo globale nel realm e aggiungere al ruolo entrambi i ruoli delle rispettive app create. Questo permetterà di avere l'audience corretta da verificare lato backend.

### Backend

Prerequisiti: Node 14

```bash
cd backend
npm i
npm run dev
```

### Frontend

Prerequisiti: Node 14, Angular 14

```bash
cd frontend
npm i
ng serve -o
```
