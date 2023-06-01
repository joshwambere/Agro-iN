import * as bcrypt from 'bcrypt';

async function hashService(text: string): Promise<string> {
  return await bcrypt.hash(text, 10);
}

async function compareHash(pwd: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(pwd, hash);
}

export { hashService, compareHash };
