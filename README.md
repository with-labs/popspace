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

Then set environment variables for your new cert:

```bash
SSL_PRIVATE_KEY_PATH = mkcert/localhost-key.pem
SSL_CERTIFICATE_PATH = mkcert/localhost.pem
```
