export const sessionTokenExists = (sessionToken: any) => {
  return !!sessionToken && sessionToken !== 'undefined' && sessionToken !== 'null';
};
