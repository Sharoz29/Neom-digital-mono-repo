export const environment = {
  timeout: 5000,
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