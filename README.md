# Local HTTPS

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

Then set environment variables for your new cert:

```bash
SSL_PRIVATE_KEY_PATH = mkcert/localhost-key.pem
SSL_CERTIFICATE_PATH = mkcert/localhost.pem
```

# Env example
```
NODE_ENV=development
EXPRESS_PORT=3030
# We use a separate port name for tests,
# so dev and test can (more safely) be run side by side
EXPRESS_PORT_TEST=3031

DEVELOPMENT_PG_USER=development_noodle
DEVELOPMENT_PG_PORT=5432
DEVELOPMENT_PG_PASSWORD=noodleso
DEVELOPMENT_PG_HOST=localhost
DEVELOPMENT_PG_DATABASE=development_noodle

AWS_APP_ACCESS_KEY=<get from aws pannel>
AWS_APP_SECRET_KEY=<get from aws pannel>
AWS_S3_REGION=<get from aws pannel>
NOODLE_USER_FILES_BUCKET=<get from aws pannel>

TWILIO_ACCOUNT_SID=<ask for them>
TWILIO_API_KEYS_ENV=<env you want to use>

TWILIO_API_KEY_SID_DEV=<ask for them>
TWILIO_API_KEY_SECRET_DEV=<ask for them>

TWILIO_API_KEY_SID_PROD=<ask for them>
TWILIO_API_KEY_SECRET_PROD=<ask for them>
```
