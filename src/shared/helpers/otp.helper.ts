import { OtpInterface } from '../interfaces/otp.interface';

export const generateOtp = (length = 4): OtpInterface => {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return { otp: result };
};

export const verifyOtp = (EXPIRES_IN: Date): boolean => {
  const currentTime = new Date().getTime();
  return currentTime <= EXPIRES_IN.getTime();
};
