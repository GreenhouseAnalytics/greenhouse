# ClickHouse DB Migrations

Manages the migrations for the ClickHouse DB server with [dbmate](https://github.com/amacneil/dbmate).

## Usage

First set the env variable `DATABASE_URL` to the DB connection URL in the `.env` file (or in your general environment).

```sh
echo 'DATABASE_URL="clickhouse://USERNAME:PASSWORD@127.0.0.1:9000/greenhouse"' > .env
```

Now you can run the migrations

```sh
yarn install
yarn dbmate up
```

For more dbmate commands, see [their documentation](https://github.com/amacneil/dbmate).

## Create new migration

Create a new migration called `create_users_table`.

```sh
yarn dbmate new create_users_table
```
