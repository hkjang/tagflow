import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '@shared/user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'tagflow-secret-key-change-in-production',
    });
  }

  async validate(payload: TokenPayload) {
    if (!payload.sub || !payload.username || !payload.role) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
