import { z } from "zod";

export const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters long" })
    .max(50, { message: "First name must be under 50 characters" })
    .trim(),
  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name must be under 50 characters" })
    .trim(),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .trim(),
  number: z
    .string()
    .min(10, { message: "Contact number must be at least 10 characters long" })
    .max(15, { message: "Contact number must be under 15 characters" })
    .regex(/^[+\d\s()-]+$/, { message: "Contact number can only contain numbers, spaces, and standard phone symbols" }),
  role: z
    .string()
    .min(1, { message: "Please select a valid program from the list" }),
  message: z
    .string()
    .min(5, { message: "Message must be at least 5 characters long" })
    .max(1000, { message: "Message must be under 1000 characters" }),
});

export type ContactFormInputs = z.infer<typeof contactFormSchema>;
