module.exports = {
  consolidateEmailString: (email) => {
    if(email) {
      return email.trim().toLowerCase()
    }
    return email
  }
}
