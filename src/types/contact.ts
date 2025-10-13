import * as z from "zod";
import { validation } from "@/utils/validation";

export const contactFormSchema = z.object({
  firstName: z.string().min(1, validation.required('firstName')),
  lastName: z.string().min(1, validation.required('lastName')),
  phoneNumbers: z.array(z.object({
    id: z.string().optional(),
    phone_type: z.string().min(1, validation.required('phoneType')),
    // Preprocess phone_number to remove non-digit characters before validation
    phone_number: z.string()
      .transform((val) => val?.replace(/[-\s./]/g, '') || '')
      .refine((val) => /^(0|\+98)?\d{10}$|^\d{7,11}$/.test(val), validation.phone),
    extension: z.string().optional().nullable(),
  })).optional(),
  emailAddresses: z.array(z.object({
    id: z.string().optional(),
    email_type: z.string().min(1, validation.required('emailType')),
    email_address: z.string().email(validation.email),
  })).optional(),
  socialLinks: z.array(z.object({
    id: z.string().optional(),
    type: z.string().min(1, validation.required('socialType')),
    url: z.string().url(validation.url),
  })).optional(),
  gender: z.enum(["male", "female", "not_specified"], validation.gender).default("not_specified"),
  position: z.string().optional(),
  company: z.string().optional(),
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  groupId: z.string().optional().nullable(),
  birthday: z.string().optional().nullable(),
  avatarUrl: z.string().url(validation.url).optional().nullable(),
  preferredContactMethod: z.enum(['email', 'phone', 'sms', 'any'], validation.preferredContactMethod).optional().nullable(),
  customFields: z.array(z.object({
    template_id: z.string(),
    value: z.string(),
  })).optional(),
  tags: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    user_id: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })).optional().default([]),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

// Define CustomField interface for form data
export interface CustomFieldFormData {
  template_id: string;
  value: string;
}

export interface PhoneNumberFormData {
  id?: string;
  phone_type: string;
  phone_number: string;
  extension?: string | null;
}

export interface EmailAddressFormData {
  id?: string;
  email_type: string;
  email_address: string;
}

export interface SocialLinkFormData {
  id?: string;
  type: string;
  url: string;
}
