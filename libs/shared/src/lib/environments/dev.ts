export const environment = {
  timeout: {
    get: 5000,
    post: 10000,
    delete: 5000,
    put: 10000,
  },
  redis: {
    host: "localhost",
    port: 6379
  },
  rabbitmq: {
    url: "amqp://localhost:5672",
  },
  production: false,
  apiUrl: 'http://localhost:3000/api'
}