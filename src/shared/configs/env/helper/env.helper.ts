import { existsSync } from 'fs';
import { resolve } from 'path';

export const getEnvs = (dest: string): string => {
  const env: string | undefined = process.env.NODE_ENV;
  const fallback: string = resolve(`${dest}/.env`);
  const fileName: string = env ? `${dest}/.env` : '.env';
  let filePath: string = resolve(`${dest}/${fileName}`);
  if (!existsSync(filePath)) {
    filePath = fallback;
  }
  return filePath;
};
