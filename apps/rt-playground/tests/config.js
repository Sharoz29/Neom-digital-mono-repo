const config = {
  baseUrl: "http://localhost:3000",
  apps: {
    cableCo: {
      rep: {
        username: "rep.cableco",
        password: "pega",
      },
      manager: {
        username: 'manager.cableco',
        password: 'pega'
      },
      tech: {
        username: 'tech.cableco',
        password: 'pega'
      },
      customer: {
        username: 'customer.cableco',
        password: 'pega'
      }
    },
  },
};

// eslint-disable-next-line no-undef
exports.config = config;

