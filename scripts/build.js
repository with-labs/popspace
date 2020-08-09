const fs = require('fs')
const cmd = require('shelljs').exec


// https://community.netlify.com/t/support-guide-using-environment-variables-on-netlify-correctly/267/5
// The intention is to make some of the build-time nev vars of netlify available at runtime.
// Netlify only allows build-time env vars via netlify.toml, and global env vars,
// which do not distinguish between different build environments.
// The toml file allows distinguishing between environments, but is not available at runtime.
// So at build time, we dump the env vars into a .env file, and load it with dotenv.
fs.writeFileSync(
  './.env',
  `NODE_ENV=${process.env.NODE_ENV}\n`
);

console.log("Successfully wrote a .env file ", process.env)

cmd('pwd', (err, msg) => {
  console.log("================PWD", msg)
  cmd("cross-env CI=false REACT_APP_SET_AUTH=passcode react-scripts build", (err, msg) => {
    if(err) {
      return console.log(err)
    }
  })

})

