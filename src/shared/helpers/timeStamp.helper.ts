export const timeStampHelper = (EXPIRES_IN) => {
  let expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + +EXPIRES_IN);
  expiresAt = new Date(expiresAt);
  return expiresAt;
};
