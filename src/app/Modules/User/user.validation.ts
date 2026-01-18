import { z } from 'zod';

const createUserValidationSchema = z.object({
  body: z.object({
    id: z.string().nonempty('User ID is required').optional(),
    email: z.string().email('Invalid email address'),
    name: z.string().nonempty('Name is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    phone: z.string().regex(/^01[0-9]{8,9}$/, 'Invalid Bangladeshi phone number'),
    role: z.enum(['superAdmin', 'admin', 'manager', 'employee']).optional(),
    status: z.enum(['in-progress', 'completed', 'pending']).optional(),
    isDeleted: z.boolean().optional(),
  }),
});

// ✅ Update User Validation Schema
export const updateUserValidationSchema = z.object({
  // id: z.string().nonempty("User ID is required").optional(),
  // email: z.string().email("Invalid email address").optional(),
  name: z.string().nonempty('Name is required').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
  // phone: z.string().regex(/^01[0-9]{8,9}$/, "Invalid Bangladeshi phone number").optional(),
  role: z.enum(['superAdmin', 'admin', 'manager', 'employee']).optional(),
  status: z.enum(['in-progress', 'blocked']).optional(),
  isDeleted: z.boolean().optional(),
});

export const loginCredentialValidationSchema = z.object({
  phone: z
    .string()
    .regex(/^01[0-9]{8,9}$/, 'Invalid Bangladeshi phone number')
    .optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
});

export const verifyOtpValidationSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  otp: z.string().min(6, 'OTP must be at least 6 characters long').optional(),
});

export type CreateUserInput = z.infer<typeof createUserValidationSchema>;

export const userZodValidations = {
  createUserValidationSchema,
  updateUserValidationSchema,
  loginCredentialValidationSchema,
};
