import jwt from 'jsonwebtoken'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret'

export function signAccessToken(payload: object, expiresIn = '15m') {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn })
}

export function signRefreshToken(payload: object, expiresIn = '7d') {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn })
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET)
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET)
} 