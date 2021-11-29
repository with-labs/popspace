module.exports = {
  apps: [
    {
      name: 'app',
      script: './server.js',
      cwd: './noodle',
    },
    {
      name: 'api',
      script: './index.js',
      cwd: 'noodle-api',
    },
    {
      name: 'hermes',
      script: './index.js',
      cwd: 'hermes',
    },
    {
      name: 'unicorn',
      script: './index.js',
      cwd: 'unicorn',
    }
  ]
}
