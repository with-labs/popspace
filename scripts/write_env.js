require("dotenv").config()

if(!process.env.NODE_ENV) {
  throw "write_env dumps build-time env vars into a context available at runtime. No build-time env vars found."
} else {
  console.log("Writing environment:", process.env.NODE_ENV)
}

const fs = require('fs')

const fetchEnvVars = () => {
  return {
    NODE_ENV: process.env.NODE_ENV,
    // Some people may have a custom config for pg in dev
    PG_PORT: process.env.PG_PORT,
    // In netlify, we'll have these from the admin console.
    // We can start by sharing credentials between staging/production,
    // and branch on NODE_ENV here if necessary
    AWS_SES_ACCESS_KEY: process.env.AWS_SES_ACCESS_KEY,
    AWS_SES_SECRET_KEY: process.env.AWS_SES_SECRET_KEY
  }
}

// https://community.netlify.com/t/support-guide-using-environment-variables-on-netlify-correctly/267/5
// https://community.netlify.com/t/netlify-functions-and-env-variables-from-netlify-toml/4404/13
// The intention is to make some of the build-time nev vars of netlify available at runtime.
// Netlify only allows build-time env vars via netlify.toml, and global env vars,
// which do not distinguish between different build environments.
// The toml file allows distinguishing between environments, but is not available at runtime.
// So at build time, we dump the env vars into a .env file, and load it with dotenv.
fs.writeFileSync('./functions/env.json', JSON.stringify(fetchEnvVars()))
