import { isLiffConfigured } from '@/config/env';
import * as realLiff from './real';
import * as mockLiff from './mock';

export const liffService = isLiffConfigured() ? realLiff : mockLiff;
