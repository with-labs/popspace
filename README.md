## Postgres

```
psql -d postgres
CREATE ROLE withso WITH PASSWORD 'withso';
ALTER ROLE "withso" WITH LOGIN;
CREATE DATABASE withso;
GRANT ALL PRIVILEGES ON DATABASE withso TO withso;

CREATE ROLE test_with WITH PASSWORD 'withsotest';
ALTER ROLE "test_with" WITH LOGIN;
CREATE DATABASE test_withso;
GRANT ALL PRIVILEGES ON DATABASE test_withso TO test_with;
```

After that, go to `with-database`, and run

```
NODE_ENV=development npm run db:migrate
NODE_ENV=test npm run db:migrate
```

## Local HTTPS

(From: https://web.dev/how-to-use-local-https/)

For Linux install homebrew first.

For MacOS and Linux:

```bash
# Only do this once for all mkcert projects
brew install mkcert
brew install nss # for Firefox
mkcert -install
# Set up this repo with mkcert certificates
# I personally just keep my mkcert right in the folder of the repo; the folder is already gitignored ~ Alexey
mkdir mkcert
cd mkcert
mkcert localhost
```

They're pulled into the app via env vars (included in the sample .env below)

```bash
SSL_PRIVATE_KEY_PATH = mkcert/localhost-key.pem
SSL_CERTIFICATE_PATH = mkcert/localhost.pem
```

# Env vars
```
NODE_ENV=development

EXPRESS_PORT=3000
TEST_PORT=3001

DEVELOPMENT_PG_USER=withso
DEVELOPMENT_PG_PORT=5432
DEVELOPMENT_PG_PASSWORD=withso
DEVELOPMENT_PG_HOST=localhost
DEVELOPMENT_PG_DATABASE=withso

TEST_PG_USER=test_with
TEST_PG_PASSWORD=withsotest
TEST_PG_HOST=localhost
TEST_PG_DATABASE=test_withso
TEST_PG_PORT=5432

# Make sure you've pre-generated these with the instructions above
SSL_PRIVATE_KEY_PATH = mkcert/localhost-key.pem
SSL_CERTIFICATE_PATH = mkcert/localhost.pem

HEARTBEAT_TIMEOUT_MILLIS=60000
NPM_WITHSO_TOKEN=token_for_with_shared_can_get_from_eg_netlify
```
