const args = {
  consolidateEmailString: (email) => {
    if(email) {
      return email.trim().toLowerCase()
    }
    return email
  },

  multiSpaceToSingleSpace: (str) => {
    // https://stackoverflow.com/questions/3286874/remove-all-multiple-spaces-in-javascript-and-replace-with-single-space
    return str.replace(/ +(?= )/g,'');
  },

  multiDashToSingleDash: (str) => {
    return str.replace(/-+(?= )/g,'');
  }
}

module.exports = args
