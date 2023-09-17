const apps = []
const countThreads = 9

for (let i = 1; i <= countThreads; i++) {
  apps.push({
    name: `search-parser-${i}`,
    script: `./dist/main.js`,
    env_production: {
      NODE_ENV: 'production',
      SERVER_PORT: 5000 + i,
      THREAD_ID: i,
    },
    env_development: {
      NODE_ENV: 'development',
      SERVER_PORT: 5000 + i,
      THREAD_ID: i,
    },
  })
}

module.exports = { apps }
