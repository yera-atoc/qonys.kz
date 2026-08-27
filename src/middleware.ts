import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname;
      if (path.startsWith('/admin')) return token?.role === 'ADMIN' || token?.role === 'MODERATOR';
      return Boolean(token);
    }
  },
  pages: { signIn: '/login' }
});

export const config = {
  matcher: ['/cabinet/:path*', '/admin/:path*', '/post']
};
