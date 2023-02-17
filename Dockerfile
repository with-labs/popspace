FROM node:16

WORKDIR /usr/src/app

COPY package.json yarn.lock ecosystem.config.js ./
COPY noodle/package.json ./noodle/package.json
COPY hermes/package.json ./hermes/package.json
COPY noodle-api/package.json ./noodle-api/package.json
COPY noodle-shared/package.json ./noodle-shared/package.json
COPY unicorn/package.json ./unicorn/package.json
COPY unicorn/component/package.json ./unicorn/component/package.json
COPY file-upload/package.json ./file-upload/package.json
COPY .git ./.git

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CYPRESS_INSTALL_BINARY=0
RUN yarn install --frozen-lockfile
# install pm2 to run server processes
RUN npm install pm2 -g
RUN pm2 install pm2-graceful-intercom

COPY noodle ./noodle
COPY hermes ./hermes
COPY noodle-api ./noodle-api
COPY noodle-shared ./noodle-shared
COPY unicorn ./unicorn
COPY file-upload ./file-upload

RUN yarn workspace @withso/noodle-shared prisma:generate

RUN yarn workspace @withso/file-upload build
RUN yarn workspace @withso/noodle-shared build
RUN yarn workspace @withso/unicorn build

COPY run.sh ./run.sh

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
