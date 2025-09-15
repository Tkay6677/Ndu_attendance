import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from './mongodb';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { db } = await connectToDatabase();
        const user = await db.collection('users').findOne({
          email: credentials.email,
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          studentId: user.studentId,
          department: user.department,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.studentId = user.studentId;
        token.department = user.department;
      }
      return token;
    },
    async session({ session, token }): Promise<any> {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.studentId = token.studentId;
        session.user.department = token.department;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};