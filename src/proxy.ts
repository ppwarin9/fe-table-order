import { auth } from '@/auth';
import { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH } from '@/lib/routes';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === ADMIN_LOGIN_PATH;

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, req.nextUrl));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL(ADMIN_HOME_PATH, req.nextUrl));
  }
});

export const config = {
  matcher: ['/admin/:path*'],
};
