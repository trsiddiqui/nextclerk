1. yarn
2. docker-compose up -d
3. yarn db-prepare
4. yarn dev

Quickbooks Integration
We need to do an authorization flow with quickbooks even after the customer has provided their ClientID and ClientSecret. Once they have performed the flow, we will store their refresh token and keep it handy until it expires so we can refresh the access token and use it.

To make it work on local, use the following flow.
1. Visit http://localhost:3000/third-party-auth/quickbooks/auth-request?entityID=f590257b-a925-45d3-b980-26ff13faf64e
2. Use the access token in the redis cache for the entityID (realmID or applicationID)
3. If the access token is expired, use the refresh token in the database

KEYCLOAK
After running docker-compose up -d bash into the container and run
/opt/keycloak/bin/kc.sh import --file /opt/keycloak/data/import/realm.json
