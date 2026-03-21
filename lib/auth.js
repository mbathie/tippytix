import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Nodemailer from 'next-auth/providers/nodemailer';
import connectDB from './mongodb';
import User from '@/models/User';
import Account from '@/models/Account';
import VerificationToken from '@/models/VerificationToken';
import { storeDevMagicLink } from './dev-auth';

const MongoDBAdapter = {
  async createUser(user) {
    await connectDB();
    const newUser = await User.create({
      name: user.name || user.email?.split('@')[0] || 'User',
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
    });
    return {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      emailVerified: newUser.emailVerified,
      image: newUser.image,
    };
  },

  async getUser(id) {
    await connectDB();
    const user = await User.findById(id);
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
    };
  },

  async getUserByEmail(email) {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
    };
  },

  async getUserByAccount({ provider, providerAccountId }) {
    await connectDB();
    const account = await Account.findOne({ provider, providerAccountId });
    if (!account) return null;
    const user = await User.findById(account.userId);
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
    };
  },

  async updateUser({ id, ...data }) {
    await connectDB();
    const user = await User.findByIdAndUpdate(id, data, { new: true });
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
    };
  },

  async linkAccount(account) {
    await connectDB();
    await Account.create({
      userId: account.userId,
      type: account.type,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      refresh_token: account.refresh_token,
      access_token: account.access_token,
      expires_at: account.expires_at,
      token_type: account.token_type,
      scope: account.scope,
      id_token: account.id_token,
      session_state: account.session_state,
    });
    return account;
  },

  async createVerificationToken({ identifier, token, expires }) {
    await connectDB();
    const verificationToken = await VerificationToken.create({
      identifier,
      token,
      expires,
    });
    return {
      identifier: verificationToken.identifier,
      token: verificationToken.token,
      expires: verificationToken.expires,
    };
  },

  async useVerificationToken({ identifier, token }) {
    await connectDB();
    const verificationToken = await VerificationToken.findOneAndDelete({
      identifier,
      token,
    });
    if (!verificationToken) return null;
    return {
      identifier: verificationToken.identifier,
      token: verificationToken.token,
      expires: verificationToken.expires,
    };
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: MongoDBAdapter,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        secure: false,
      },
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { createTransport } = await import('nodemailer');

        if (process.env.NODE_ENV !== 'production') {
          storeDevMagicLink(email, url);
        }

        const transport = createTransport(provider.server);

        try {
          await transport.sendMail({
            to: email,
            from: provider.from,
            subject: 'Sign in to TippyTix',
            text: `Sign in to TippyTix\n\nClick this link to sign in:\n${url}\n\nIf you didn't request this email, you can safely ignore it.`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #6d28d9;">Sign in to TippyTix</h1>
                <p>Click the button below to sign in to your account:</p>
                <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #6d28d9, #ec4899); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                  Sign In
                </a>
                <p style="color: #666; font-size: 14px;">Or copy this link: ${url}</p>
                <p style="color: #999; font-size: 12px;">If you didn't request this email, you can safely ignore it.</p>
              </div>
            `,
          });
        } catch (error) {
          console.error('Email sending error:', error.message);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/verify-request',
    error: '/auth-error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return {
        id: token.id,
        name: token.name,
        email: token.email,
        sub: token.sub,
        iat: token.iat,
        exp: token.exp,
        jti: token.jti,
      };
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        await connectDB();
        const user = await User.findById(token.id).select('image isAdmin').lean();
        if (user?.image) {
          session.user.image = user.image;
        }
        session.user.isAdmin = user?.isAdmin === true;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/dashboard`;
      }
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
  },
  session: {
    strategy: 'jwt',
  },
});
