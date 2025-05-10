import { z } from 'zod';

export const slugSchema = z
  .string()
  .min(3, { message: "validation.minLength" })
  .max(30, { message: "validation.maxLength" })
  .regex(/^[a-z0-9-]+$/, { message: "validation.pattern" })
  .transform(val => val.toLowerCase());

export const cardSchema = z.object({
  slug: slugSchema,
  firstName: z.string().min(1, { message: "validation.required" }),
  lastName: z.string().min(1, { message: "validation.required" }),
  organization: z.string().min(1, { message: "validation.required" }),
  title: z.string().min(1, { message: "validation.required" }),
  email: z.string().email({ message: "validation.email" }),
  phone: z.string().min(5, { message: "validation.phone" }),
  website: z.string().url({ message: "validation.url" }).optional().or(z.literal('')),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
  theme: z.string().default('default'),
  photo: z.string().optional(),
});

export type CardFormData = z.infer<typeof cardSchema>;

// Function to generate a slug from first and last name
export function generateSlug(firstName: string, lastName: string): string {
  const baseSlug = `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
  
  // If there's a collision, append a random 6-char hash
  if (baseSlug.length < 3) {
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `card-${randomPart}`;
  }
  
  return baseSlug;
}
