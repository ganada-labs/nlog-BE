import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? 'client_id';
const GOOGLE_CLIENT_SECRET =
  import.meta.env.VITE_GOOGLE_CLIENT_SECRET ?? 'client_secret';
const GOOGLE_CALLBACK_URL =
  import.meta.env.VITE_GOOGLE_CALLBACK_URL ?? 'client_callback_url';

const strategy = new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
  },
  async (_, __, profile, done) => {
    try {
      return done(null, profile);
    } catch (err) {
      return done(null, false, { message: 'create user failed' });
    }
  }
);

export default strategy;
