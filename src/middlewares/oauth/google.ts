import { passport } from '@/packages/passport';

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
