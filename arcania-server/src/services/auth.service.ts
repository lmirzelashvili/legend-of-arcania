import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../middleware/errors.js';
import type { JwtPayload } from '../middleware/auth.js';

const SALT_ROUNDS = 10;

export async function register(email: string, username: string, password: string) {
  if (!email || !username || !password) {
    throw new AppError(400, 'All fields are required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError(400, 'Invalid email format');
  }

  if (username.length < 3 || username.length > 20) {
    throw new AppError(400, 'Username must be between 3 and 20 characters');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    throw new AppError(400, 'Username can only contain letters, numbers, underscores, and hyphens');
  }

  if (password.length < 8) {
    throw new AppError(400, 'Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new AppError(400, 'Password must contain uppercase, lowercase, and a number');
  }

  const normalizedEmail = email.toLowerCase();

  // Generic error to prevent account enumeration
  const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  const existingUsername = await prisma.user.findFirst({
    where: { username: { equals: username, mode: 'insensitive' } },
  });
  if (existingEmail || existingUsername) {
    throw new AppError(409, 'Registration failed. Email or username may already be in use.');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      username,
      passwordHash,
      wallet: { create: {} },
      loginStreak: { create: {} },
      vault: { create: {} },
    },
    select: { id: true, email: true, username: true },
  });

  const token = generateToken(user.id, user.email);

  return { user, token };
}

export async function login(email: string, password: string) {
  if (!email || !password) {
    throw new AppError(400, 'Email and password are required');
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true, username: true, passwordHash: true },
  });

  if (!user) {
    throw new AppError(401, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Invalid email or password');
  }

  const token = generateToken(user.id, user.email);

  return {
    user: { id: user.id, email: user.email, username: user.username },
    token,
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return user;
}

export async function refreshToken(currentToken: string): Promise<{ token: string }> {
  let decoded: JwtPayload & { exp?: number };

  try {
    decoded = jwt.verify(currentToken, env.JWT_SECRET, { ignoreExpiration: true }) as JwtPayload & { exp?: number };
  } catch {
    throw new AppError(401, 'Invalid token');
  }

  // If the token has an exp claim, check it is within the 1-hour grace window
  if (decoded.exp !== undefined) {
    const nowSeconds = Math.floor(Date.now() / 1000);
    const secondsSinceExpiry = nowSeconds - decoded.exp;
    const GRACE_WINDOW_SECONDS = 60 * 60; // 1 hour
    if (secondsSinceExpiry > GRACE_WINDOW_SECONDS) {
      throw new AppError(401, 'Token expired. Please log in again.');
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new AppError(401, 'User not found');
  }

  const token = generateToken(user.id, user.email);
  return { token };
}

function generateToken(userId: string, email: string): string {
  const payload: JwtPayload = { userId, email };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}
