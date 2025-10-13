import jwt, { JwtPayload } from 'jsonwebtoken';

export const createToken = (jwtPayload: JwtPayload, secret: jwt.Secret, expireTime: string) => {
  return jwt.sign(jwtPayload, secret, { expiresIn: expireTime } as jwt.SignOptions);
};
