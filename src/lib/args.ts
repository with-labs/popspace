const args = {
  consolidateEmailString: (email: string) => {
    if (email) {
      return email.trim().toLowerCase();
    }
    return email;
  },

  multiSpaceToSingleSpace: (str: string) => {
    // https://stackoverflow.com/questions/3286874/remove-all-multiple-spaces-in-javascript-and-replace-with-single-space
    return str.replace(/ +(?= )/g, '');
  },

  multiDashToSingleDash: (str: string) => {
    return str.replace(/-+(?= )/g, '');
  },
};

export default args;
