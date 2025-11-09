
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

                                const user = await prisma.user.findUnique({
                                  where: { email: credentials.email },
                                });
                                console.log('Authorize Callback - user from DB:', user);
                        
                                if (user && user.password) {
                                  const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                        
                                  if (isPasswordValid) {
                                    const userReturned = {
                                      id: user.id,
                                      name: `${user.nombres} ${user.apellido_paterno}`,
                                      email: user.email,
                                      image: user.image,
                                      isSuperAdmin: user.isSuperAdmin,
                                      isEnrollmentAdmin: user.isEnrollmentAdmin,
                                      isProfesor: user.isProfesor,
                                      isStudent: user.isStudent,
                                    };
                                    console.log('Authorize Callback - user returned:', userReturned);
                                    return userReturned;
                                  }
                                }        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT Callback - token (before update):', token);
      console.log('JWT Callback - user:', user);
      // El objeto 'user' solo está disponible en el primer login
      if (user) {
        token.id = user.id;
        token.isSuperAdmin = user.isSuperAdmin;
        token.isEnrollmentAdmin = user.isEnrollmentAdmin;
        token.isProfesor = user.isProfesor;
        token.isStudent = user.isStudent;
      } else if (token.id) { // Si el usuario no está presente, pero el token tiene un ID, es una llamada subsiguiente
        // Asegurarse de que los roles persistan del token existente
        token.isSuperAdmin = token.isSuperAdmin;
        token.isEnrollmentAdmin = token.isEnrollmentAdmin;
        token.isProfesor = token.isProfesor;
        token.isStudent = token.isStudent;
      } else {
        // Si no hay usuario ni ID en el token, inicializar roles a false
        token.isSuperAdmin = false;
        token.isEnrollmentAdmin = false;
        token.isProfesor = false;
        token.isStudent = false;
      }
      console.log('JWT Callback - token (after update):', token);
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback - session:', session);
      console.log('Session Callback - token:', token);
      // Añade las capacidades al objeto de sesión
      if (session.user) {
        session.user.id = token.id;
        session.user.isSuperAdmin = token.isSuperAdmin;
        session.user.isEnrollmentAdmin = token.isEnrollmentAdmin;
        session.user.isProfesor = token.isProfesor;
        session.user.isStudent = token.isStudent;
      }
      console.log('Session Callback - session (after update):', session);
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Siempre permite la redirección a la URL de callback si es segura
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      
      // Redirección temporal: siempre a /dashboard para depurar
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
