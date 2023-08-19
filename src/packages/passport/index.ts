import passport from 'koa-passport';
import googleStrategy from './google';
import localStrategy from './local';

passport.use(googleStrategy.name, googleStrategy);
passport.use('local', localStrategy);

export const googleOAuth = passport.authenticate('google', {
  session: false,
  scope: ['profile', 'email'],
  accessType: 'offline',
  prompt: 'consent',
});

export const googleOAuthCallback = passport.authenticate('google', {
  session: false,
  failureRedirect: '/callback/failure',
});

export { passport };
