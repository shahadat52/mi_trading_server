import { z } from 'zod';



const createUserValidationSchema = z.object({
    id: z.string().nonempty("User ID is required"),
    email: z.string().email("Invalid email address"),
    name: z.string().nonempty("Name is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    phone: z.string().regex(/^01[0-9]{8,9}$/, "Invalid Bangladeshi phone number"),
    role: z.enum(["admin", "user"]),
    status: z.enum(["in-progress", "completed", "pending"]),
    isDeleted: z.boolean(),
});



// ✅ Update User Validation Schema
export const updateUserValidationSchema = z.object({
    id: z.string().nonempty("User ID is required"),
    email: z.string().email("Invalid email address"),
    name: z.string().nonempty("Name is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    phone: z.string().regex(/^01[0-9]{8,9}$/, "Invalid Bangladeshi phone number"),
    role: z.enum(["superAdmin", "admin", "manager", "employee"]).optional(),
    status: z.enum(["in-progress", "completed", "pending"]).optional(),
    isDeleted: z.boolean().optional(),

});

export type CreateUserInput = z.infer<typeof createUserValidationSchema>;

export const userZodValidations = {
    createUserValidationSchema,
    updateUserValidationSchema,
}; 
