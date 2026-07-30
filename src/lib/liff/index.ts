import * as realLiff from './real';
import * as mockLiff from './mock';

const isDev = process.env.NODE_ENV === 'development';
export const liffService = isDev ? mockLiff : realLiff;
