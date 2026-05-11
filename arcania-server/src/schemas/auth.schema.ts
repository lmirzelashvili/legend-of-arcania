import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().min(1, 'email is required'),
  username: z.string().min(1, 'username is required'),
  password: z.string().min(1, 'password is required'),
});

export const LoginSchema = z.object({
  email: z.string().min(1, 'email is required'),
  password: z.string().min(1, 'password is required'),
});
