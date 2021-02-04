const url = require('url');
const db_url = process.env.NODE_ENV === 'development' ? process.env.DEV_DATABASE_URL : process.env.DATABASE_URL;
const params = url.parse(db_url);
const auth = params.auth.split(':');
const config = {
  user: auth[0],
  password: auth[1],
  host: params.hostname,
  port: params.port,
  database: params.pathname.split('/')[1],
  ssl: true
};

module.exports = {
 "production": {
  "username": config.user,
  "password": config.password,
  "host": config.host,
  "port": config.port,
  "database": config.database,
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true
      }
    },
    "sslmode": "require",
    "ssl": true
  },
  "test": {
    "username": config.user,
    "password": config.password,
    "host": config.host,
    "port": config.port,
    "database": config.database,
      "dialect": "postgres",
      "dialectOptions": {
        "ssl": {
          "require": true
        }
      },
      "sslmode": "require",
      "ssl": true
    },
  "development": {
    "username": "john",
    "password": "john1991",
    "database": "trans12",
    "host": "127.0.0.1",
    "dialect": "postgres",
    "operatorsAliases": false
  }
}
