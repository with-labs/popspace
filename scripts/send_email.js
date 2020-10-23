require("dotenv").config()
const commandLineArgs = require('command-line-args')
const lib = require("../functions/lib/index.js")
const readline = require('readline');

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
const sendEmail = async (to, emailName, args, production) => {
  const appUrl = APP_URL[process.env.NODE_ENV]
  await lib.email.marketing[`sendEmail${emailName}`](to, appUrl, args)
}

const awaitUserInput = async () => {
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
  });
  return new Promise(resolve => rl.question("Confinue? (Yes to confirm): ", ans => {
    rl.close();
    resolve(ans);
  }))
}
const sendMarketingBlast = async (emailName, args, production) => {
  const criteriaObject = {
    deleted_at: null,
    newsletter_opt_in: true,
    "email ILIKE": "%@with.so"
  }
  if(production) {
    delete criteriaObject["email ILIKE"]
  }
  const targets = await db.pg.massive.users.find(criteriaObject)
  console.log("Target emails: ", targets.map((t) => (t.email)).join(', '))
  console.log("Total", targets.length)
  const confirmation = await awaitUserInput()
  if(confirmation != "Yes") {
    return
  }
  const promises = targets.map(async (t) => {
    console.log(`Sending to ${t.email}`)
    await sendEmail(t.email, emailName, args)
  })
  return Promise.all(promises)
}

const run = async () => {
  const optionDefinitions = [
    { name: 'name', alias: 'n', type: String },
    { name: 'args', alias: 'a', type: String },
    { name: 'to', alias: 't', type: String},
    { name: 'marketing_blast', type: Boolean},
    { name: 'production', type: Boolean}
  ]
  const options = commandLineArgs(optionDefinitions)
  const to = options.to
  const emailName = options.name
  const isMarketingBlast = options.marketing_blast
  if((!isMarketingBlast && !to) || !emailName) {
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
    if(isMarketingBlast) {
      await sendMarketingBlast(emailName, args, options.production)
    } else {
      await sendEmail(to, emailName, args, options.production)
    }
  } catch(e) {
    console.log(e)
  } finally {
    process.exit(0)
  }
}

run()

