FROM node:24.22.1

WORKDIR /usr/src/app

COPY package.json yarn.lock ecosystem.config.js ./
COPY noodle/package.json ./noodle/package.json
COPY hermes/package.json ./hermes/package.json
COPY noodle-api/package.json ./noodle-api/package.json
COPY noodle-shared/package.json ./noodle-shared/package.json
COPY unicorn/package.json ./unicorn/package.json
COPY unicorn/component/package.json ./unicorn/component/package.json
COPY file-upload/package.json ./file-upload/package.json
COPY pop-media/sdk/package.json ./pop-media/sdk/package.json
COPY pop-media/livekit/package.json ./pop-media/livekit/package.json
COPY .git ./.git

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CYPRESS_INSTALL_BINARY=0
RUN yarn install --frozen-lockfile
# install pm2 to run server processes
RUN npm install -g pm2@6.0.14
RUN pm2 install pm2-graceful-intercom@1.0.1

COPY noodle ./noodle
COPY hermes ./hermes
COPY noodle-api ./noodle-api
COPY noodle-shared ./noodle-shared
COPY unicorn ./unicorn
COPY file-upload ./file-upload
COPY pop-media ./pop-media

RUN yarn workspace @withso/noodle-shared prisma:generate

# "true" makes the UI reach the API, hermes and unicorn under /api, /hermes
# and /unicorn on its own origin (reverse proxy) instead of ports 8889-8891
ARG REACT_APP_SERVICE_PATHS

# build the libraries, the UI and the unicorn app inside the image so a
# clean checkout is enough to run `docker build` / `docker compose build`
RUN NODE_OPTIONS=--max-old-space-size=4096 yarn precontainerize

COPY run.sh ./run.sh
# checkouts made on Windows may have CRLF line endings
RUN sed -i 's/\r$//' run.sh

# just in case
RUN rm .env || true
RUN rm ./noodle/.env || true
RUN rm ./hermes/.env || true
RUN rm ./noodle-api/.env || true
RUN rm ./noodle-shared/.env || true
RUN rm ./unicorn/.env || true
RUN rm ./file-upload/.env || true

ENV NODE_ENV production
ENV NODE_OPTIONS='--max-http-header-size=100000'
ENV APP_PORT=8888
ENV API_PORT=8889
ENV HERMES_PORT=8890
ENV UNICORN_PORT=8891

CMD ["sh", "./run.sh"]
