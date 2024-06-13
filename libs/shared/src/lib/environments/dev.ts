export const environment = {
  timeout: {
    get: 5000,
    post: 10000,
    delete: 5000,
    put: 10000,
  },
  redis: {
    host: 'localhost',
    port: 6379,
  },
  rabbitmq: {
    url: 'amqp://localhost:5672',
  },
  pega: {
    baseUrl: `https://web.pega23.lowcodesol.co.uk/prweb/app/call-a-doctor/api/application/v2`,
    basev1Url: `https://web.pega23.lowcodesol.co.uk/prweb/app/call-a-doctor/api/v1`,
  },
  mqtt: {
    host: '192.168.60.102',
    port: 1883,
    username: 'mqtt-test',
    password: 'mqtt-test',
    url: `mqtt://192.168.60.102:1883`,
  },
  cumulocity: {
    username: 'email_here',
    password: 'password_here',
    tenantid: 'tenant_id',
    url: 'mqtt://tenant_id.eu-latest.cumulocity.com:1883',
  },
  production: false,
  apiUrl: 'http://localhost:5001/api/v1',
  ngApiUrl: 'http://localhost:5001',
  CASETYPES: '/casetypes',
  WORKLIST: `/D_Worklist`,
  OPERATORID: `/D_OperatorID`,
  AUTHENTICATE: '/authenticate',
  CASES: '/cases',
  VIEWS: '/views',
  ASSIGNMENTS: '/assignments',
  ACTIONS: '/actions',
  PAGES: '/pages',
  DATA: '/data',
  REFRESH: '/refresh',
  // V2 endpoints
  NAVIGATION_STEPS: '/navigation_steps',
};
