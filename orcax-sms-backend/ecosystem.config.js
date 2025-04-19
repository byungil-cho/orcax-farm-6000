module.exports = {
  apps: [
    {
      name: "orcax-sms-backend",
      script: "./server.js", // ✅ 실제 실행할 진입점 파일!
      watch: true,
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ]
}
