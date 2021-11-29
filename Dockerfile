FROM node:16

WORKDIR /usr/src/app

COPY noodle ./noodle
COPY hermes ./hermes
COPY noodle-api ./noodle-api
COPY noodle-shared ./noodle-shared
COPY unicorn ./unicorn
COPY file-upload ./file-upload
COPY package.json yarn.lock ecosystem.config.js ./
COPY .git ./.git

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CYPRESS_INSTALL_BINARY=0

# install pm2 to run server processes
RUN npm install pm2 -g
RUN pm2 install pm2-graceful-intercom

RUN yarn
RUN yarn workspace @withso/file-upload build
RUN yarn workspace @withso/noodle-shared build
RUN yarn workspace @withso/unicorn build

ENV NODE_ENV production
ENV NODE_OPTIONS='--max-http-header-size=100000'
ENV APP_PORT=8888
ENV API_PORT=8889
ENV HERMES_PORT=8890
ENV UNICORN_PORT=8891

CMD ["pm2-runtime", "ecosystem.config.js"]
