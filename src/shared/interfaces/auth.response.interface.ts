import { tokensType } from './token.interface';

export interface AuthResponseInterface<T> {
  message: string;
  tokens: tokensType;
  data: T;
}
