# Notes on development

Generating certificates ( https://medium.com/@niktrix/self-signed-certificate-in-macos-sierra-3580dcd06693 ):

```
openssl req -x509 -nodes -sha256 -days 10000 -newkey rsa:2048 -keyout key.pem -out certificate.pem
```

for mac, you can also add it to keychain:

```
sudo security add-trusted-cert -d -r trustAsRoot -k /Library/Keychains/System.keychain certificate.pem
```

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

## Using a custom root CA for local TLS

(From: https://web.dev/how-to-use-local-https/)

For MacOS:

```bash
brew install mkcert
brew install nss # for Firefox
mkcert -install
cd /path/where/i/keep/cert
mkcert localhost
```

Then set environment variables for your new cert:

```bash
SSL_PRIVATE_KEY_PATH = /path/where/i/keep/cert/localhost-key.pem
SSL_CERTIFICATE_PATH = /path/where/i/keep/cert/localhost.pem
```
