import passport from 'koa-passport';
import googleStrategy from './google';
import localStrategy from './local';

passport.use(googleStrategy.name, googleStrategy);
passport.use('local', localStrategy);

export default passport;
