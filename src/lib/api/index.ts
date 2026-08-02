import type { ApiClient } from '@/lib/api/contract';
import * as session from '@/lib/api/live/session';
import * as menu from '@/lib/api/live/menu';
import * as cart from '@/lib/api/live/cart';
import * as order from '@/lib/api/live/order';
import * as bill from '@/lib/api/live/bill';
import * as admin from '@/lib/api/live/admin';
import * as staff from '@/lib/api/live/staff';
import { login } from '@/lib/api/live/auth';

export const api: ApiClient = {
  ...session,
  ...menu,
  ...cart,
  ...order,
  ...bill,
  ...admin,
  ...staff,
  login,
};
