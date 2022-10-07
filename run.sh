#! /bin/sh
# migrate the database, then run pm2

# migrate the database
echo "Migrating the database..."
yarn db-init

# run pm2
pm2-runtime ecosystem.config.js
