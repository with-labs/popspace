// Email helper utilities

// regex that checks if an email is valid or not
// http://emailregex.com/
const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// helper method that checks if an email is valid or not
export const isEmailValid = (email: string) => {
  return emailRegex.test(email);
};
