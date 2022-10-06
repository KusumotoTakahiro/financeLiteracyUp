export const isMail = (address) => {
  if (!address) {
    return false;
  }
  let regex = new RegExp(
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  );
  if (address.match(regex)) {
    return true;
  }
  return false;
};