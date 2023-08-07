import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
  VerifyCallback,
} from 'passport-jwt';
import UserModel from '@/models/user';
import { isNil } from '@/utils';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET;

const option = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
} satisfies StrategyOptions;

const verify: VerifyCallback = async (payload, done) => {
  const { email, provider } = payload;

  if (isNil(email) || isNil(provider)) {
    return done(null, false, {
      message: '토큰에 필요한 정보가 포함되지 않음',
    });
  }

  const userData = await UserModel.read({ email });

  if (isNil(userData)) {
    return done(null, false, {
      message: '존재하지 않는 계정',
    });
  }

  return done(null, payload);
};

const strategy = new JwtStrategy(option, verify);

export default strategy;
