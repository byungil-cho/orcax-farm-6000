module.exports = {
  apps: [
    {
      name: "orcax-sms-backend",
      script: "server.js",
      env: {
        PORT: 3004,
        SMS_API_KEY: "orcax_super_secret_key_2025"
      }
    }
  ]
};
