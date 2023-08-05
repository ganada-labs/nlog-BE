import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET;

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
  session: false,
};

/**
 * TODO: 더 자세한 로컬 인증 전략을 새워야함
 */
const strategy = new JwtStrategy(options, async (jwtPayload, done) => {
  if (Date.now() >= jwtPayload.exp * 1000) {
    return done(null, false, {
      status: 401,
      message: '토큰이 만료되었습니다',
    });
  }
  return done(null, jwtPayload);
});

export default strategy;
