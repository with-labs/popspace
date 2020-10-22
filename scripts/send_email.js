require("dotenv").config()
const commandLineArgs = require('command-line-args')
const lib = require("../functions/lib/index.js")

const APP_URL = {
  "development": "http://localhost:8888",
  "staging": "https://dev.app.with.so",
  "production": "https://app.with.so"
}

const usage = () =>{
  return `Usage:\n npm run email:send_one --to=xx@yy.zxz --name=signin_or_other --args="['hello', 'world']"`
}

/**
This script is used for sending any of the emails we currently have.

Used to test emails in an actual inbx after they've been created.
*/
const sendEmail = async (to, emailName, args) => {
  const appUrl = APP_URL[process.env.NODE_ENV]
  await lib.email.marketing[`sendEmail${emailName}`](to, appUrl, args)
}

const run = async () => {
  const optionDefinitions = [
    { name: 'name', alias: 'n', type: String },
    { name: 'args', alias: 'a', type: String },
    { name: 'to', alias: 't', type: String}
  ]
  const options = commandLineArgs(optionDefinitions)
  const to = options.to
  const emailName = options.name
  if(!to || !emailName) {
    console.log(usage())
    return
  }

  let args = []
  if(options.args) {
    try {
      let args = JSON.parse(options.args)
    } catch(e) {
      console.log("Could not parse args; please pass an array of strings")
    }
  }

  await lib.init()

  try {
    await sendEmail(to, emailName, args)
  } catch(e) {
    console.log(e)
  } finally {
    process.exit(0)
  }
}

run()

