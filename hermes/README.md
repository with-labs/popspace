## Running in dev mode

```
yarn dev
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

That's not the end of the story if you want to run tests, though.

### Running tests with local HTTPS
Even though mkcert certificates are a step up from being self-signed, since there's a self-issued certificate authority that signed them, the CA (Certificate Authority) is not recognizable by standard HTTPS clients (e.g. via `fetch` or node's `https` module): they will error out with UNABLE_TO_VERIFY_LEAF_SIGNATURE`, saying `Error: unable to verify the first certificate.

To bypass this, a client can be told to accept certificates issued by a certain certificate authority. CAs are identified via public keys: each certificate issued by a CA is signed with its private key.

So we need to pass the public key into the client, to let them know to trust that CA; `fetch` and `https` both support this via the `{ca: public_key_aka_certificate}` option.

Now we just need to find where mkcert put the certificates for its CA:
```bash
mkcert -CAROOT
```

E.g. on a mac it will print something like:
```bash
/Users/alexey/Library/Application Support/mkcert
```
Which has
```bash
% ls '/Users/alexey/Library/Application Support/mkcert'
rootCA-key.pem rootCA.pem
```

`rootCA.pem` is the certificate (you can figure it out because they're not calling it a key). Either set the `SSL_ROOTCA_PATH` to the global path, or copy the certificate into the `mkcert` directory - since it's not committed anyway.

# Env vars
```
NODE_ENV=development
DATABASE_URL=postgres://<YOUR DB USER>:<YOUR DB PASS>@<YOUR DB HOST>:5432/<YOUR DB NAME>

# Make sure you've pre-generated these with the instructions above
SSL_PRIVATE_KEY_PATH = mkcert/localhost-key.pem
SSL_CERTIFICATE_PATH = mkcert/localhost.pem
SSL_ROOTCA_PATH = mkcert/rootCA.pem
```
