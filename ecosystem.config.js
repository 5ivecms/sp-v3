module.exports = {
  apps: [
    {
      name: 'search-parser-dev',
      script: './dist/main.js',
      env_production: {
        NODE_ENV: 'production',
      },
      env_development: {
        NODE_ENV: 'development',
      },
    },
  ],
}
