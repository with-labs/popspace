class Dev {
  constructor() {

  }

  log(...args) {
    console.log("==================================")
    console.log(args)
    console.log("==================================")
  }
}

module.exports = new Dev()
