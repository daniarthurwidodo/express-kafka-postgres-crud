const config = {
  postgres: {
    user: 'user',
    host: 'localhost',
    database: 'mydb',
    password: 'password',
    port: 5432,
  },
  kafka: {
    clientId: 'my-app',
    brokers: ['localhost:9092'],
  },
  server: {
    port: process.env.PORT || 3000
  }
};

module.exports = config;