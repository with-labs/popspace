# Running in dev mode

```
yarn dev
```

This runs 2 processes in pm2 to ensure the code works in a multi-process setup.

# Local HTTPS

(From: https://web.dev/how-to-use-local-https/)

For *Linux only* install homebrew first :
```
# from https://brew.sh/
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

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

# get the location where cert authority stashed its keys
mkcert -CAROOT
```

Then set environment variables for your new cert:

```bash
SSL_PRIVATE_KEY_PATH = mkcert/localhost-key.pem
SSL_CERTIFICATE_PATH = mkcert/localhost.pem
SSL_CAROOT_PATH= "<path to CA root location>/rootCA.pem"
```

# Env example
```
NODE_ENV=development
DATABASE_URL=postgres://<YOUR DB USER>:<YOUR DB PASS>@<YOUR DB HOST>:5432/<YOUR DB NAME>

# you must have access to this bucket using the credentials below
WALLPAPER_FILES_BUCKET_NAME=noodle-wallpapers
WALLPAPER_FILES_ORIGIN=https://wallpapers.noodle.so

TWILIO_ACCOUNT_SID=<PROVIDE THIS>
TWILIO_API_KEY_SECRET=<PROVIDE THIS>
TWILIO_API_KEY_SID=<PROVIDE THIS>

USER_FILES_BUCKET_NAME=userfiles.noodle.so

AWS_REGION=<PROVIDE THIS>
AWS_ACCESS_KEY_ID=<PROVIDE THIS>
AWS_SECRET_ACCESS_KEY=<PROVIDE THIS>

```


# Running
We're using pm2 to run the app - which does many important things for us:
- Restarts the process when it dies
- Reloads w/o downtime during a deploy
- Speeds up development via hot-reload/watch-mode
- Runs multiple threads - which means that if a thread dies, another is available to process requests

A wrinkle is that we're also using log4js, and we write logs to files. So each of the subthreads
needs to deliver its logs to the same file.

Luckily, log4js has deeply integrated with pm2's cluster mode (i.e. the multi-threaded mode),
but to get it to work we rely on pm2-intercom.

One caveat is that we also try to gracefully start pm2 - have it wait for us to establish database connections, etc.
pm2 explicitly supports this via --wait-ready; it expects a "ready" process signal.
Unfortunately, pm2-intercom's IPC is not compatible with that, and throws an error:
```
4|pm2-intercom  | Error: ID, DATA or TOPIC field is missing
```

So we rely on a fork of pm2-intercom called `pm2-graceful-intercom`. It special-cases the "ready" signal (otherwise,
pm2-intercom expects a JSON format for signals).
Long story short:

```bash
# First time only - installs the pm2-graceful-intercom module
yarn run prepare_logs

# Starting - in production, only do this once
yarn start

# Deploying - zero downtime
git pull origin main
yarn install
yarn reload

# Utilize hot reload in dev
yarn dev

# Stopping - this does not clear pm2's processes
yarn stop

# Hard stop - clear out the pm2 processes
pm2 delete noodle_api

```
