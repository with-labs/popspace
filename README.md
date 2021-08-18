# noodle-shared

Shared code between Noodle microservices

## Using testing tools

Import them from `@withso/noodle-shared/test`:

```
const { test, tool } = require('@withso/noodle-shared/test');
```

## Database migration

This library includes Prisma, our database connection client. Prisma takes care of managing database migrations by generating new SQL migration files to conform the database structure to the schema we maintain in `./prisma/schema.prisma`.

### Setting up your development environment

To create local databases for developing and testing, you can do the following:

In `psql`:

```
CREATE ROLE development_noodle WITH PASSWORD 'noodleso';
ALTER ROLE "development_noodle" WITH LOGIN, CREATEDB;
CREATE DATABASE development_noodle;
GRANT ALL PRIVILEGES ON DATABASE development_noodle TO development_noodle;

CREATE ROLE test_noodle WITH PASSWORD 'noodleso';
ALTER ROLE "test_noodle" WITH LOGIN, CREATEDB;
CREATE DATABASE test_noodle;
GRANT ALL PRIVILEGES ON DATABASE test_noodle TO test_noodle;
```

Then create or edit a `.env` file and add the following:

```
DEVELOPMENT_PG_USER=development_noodle
DEVELOPMENT_PG_PORT=5432
DEVELOPMENT_PG_PASSWORD=noodleso
DEVELOPMENT_PG_HOST=localhost
DEVELOPMENT_PG_DATABASE=development_noodle

TEST_PG_USER=test_noodle
TEST_PG_PORT=5432
TEST_PG_PASSWORD=noodleso
TEST_PG_HOST=localhost
TEST_PG_DATABASE=test_noodle

# change this to run migrations against different databases
DATABASE_URL="postgresql://development_noodle:noodleso@localhost:5432/development_noodle"
# DATABASE_URL="postgresql://test_noodle:noodleso@localhost:5432/test_noodle"
```

The library is in a somewhat transitional state
