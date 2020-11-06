const basicLog = (tag) => {
  /*
    TODO: what do we want to do for our logging?
    We could send everything to CloudWatch.
    We could have some logging store that works better for us.
    We could store logs in a db or in s3, e.g. Firehose directly supports this.
    Do we want to funnel all errors to a separate storage?
  */
  const timestamp = () => {
    return new Date()
  }
  return {
    info: (...args) => {
      console.log(timestamp(), tag, args)
    },
    warning: (...args) => {
      console.log(timestamp(), tag, args)
    },
    error: (...args) => {
      console.log(timestamp(), tag, args)
    }
  }
}

module.exports = {
  email: basicLog("-[email]- ")
}
