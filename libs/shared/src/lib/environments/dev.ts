import axios from 'axios';

export const environment = {
  timeout: 5000,
  redis: {
    host: 'localhost',
    port: 6379,
  },
  rabbitmq: {
    url: 'amqp://localhost:5672',
  },
  pega: {
    baseUrl: `https://web.pega23.lowcodesol.co.uk/prweb/app/call-a-doctor/api/application/v2`,
    basev1Url: `https://web.pega23.lowcodesol.co.uk/prweb/app/call-a-doctor/api/v1/data`,
  },
  production: false,
  apiUrl: 'http://localhost:3000/api',
  CASETYPES: '/casetypes',
  WORKLIST: `/D_Worklist`,
  OPERATORID: `/D_OperatorID`,
};
