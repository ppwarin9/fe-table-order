import { loginAndFetchProfile } from '@/lib/api/live/auth';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/admin/login' },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === 'string'
            ? credentials.email
            : undefined;
        const password =
          typeof credentials?.password === 'string'
            ? credentials.password
            : undefined;
        if (!email || !password) return null;

        try {
          const profile = await loginAndFetchProfile(email, password);
          return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role,
            accessToken: profile.accessToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.role = token.role as string;
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
