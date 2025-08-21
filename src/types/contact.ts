import * as z from "zod";
import { CustomFieldTemplate } from "@/domain/schemas/custom-field-template";

export const contactFormSchema = z.object({
  firstName: z.string().min(1, { message: "نام الزامی است." }),
  lastName: z.string().min(1, { message: "نام خانوادگی الزامی است." }),
  phoneNumbers: z.array(z.object({
    id: z.string().optional(),
    phone_type: z.string().min(1, { message: "نوع شماره الزامی است." }),
    phone_number: z.string().regex(/^09\d{9}$/, { message: "شماره تلفن معتبر نیست (مثال: 09123456789)." }),
    extension: z.string().optional().nullable(),
  })).optional(),
  emailAddresses: z.array(z.object({
    id: z.string().optional(),
    email_type: z.string().min(1, { message: "نوع ایمیل الزامی است." }),
    email_address: z.string().email({ message: "آدرس ایمیل معتبر نیست." }),
  })).optional(),
  socialLinks: z.array(z.object({
    id: z.string().optional(),
    type: z.string().min(1, { message: "نوع شبکه اجتماعی الزامی است." }),
    url: z.string().url({ message: "آدرس URL معتبر نیست." }),
  })).optional(),
  gender: z.enum(["male", "female", "not_specified"], { message: "جنسیت معتبر نیست." }).default("not_specified"),
  position: z.string().optional(),
  company: z.string().optional(),
  street: z.string().optional(), // New: Detailed address field
  city: z.string().optional(),    // New: Detailed address field
  state: z.string().optional(),   // New: Detailed address field
  zipCode: z.string().optional(), // New: Detailed address field
  country: z.string().optional(), // New: Detailed address field
  notes: z.string().optional(),
  groupId: z.string().optional(),
  birthday: z.string().optional().nullable(),
  avatarUrl: z.string().url({ message: "آدرس URL تصویر معتبر نیست." }).optional().nullable(), // New: Avatar URL
  preferredContactMethod: z.enum(['email', 'phone', 'sms', 'any'], { message: "روش ارتباط ترجیحی معتبر نیست." }).optional().nullable(), // New: Preferred contact method
  customFields: z.array(z.object({
    template_id: z.string(),
    value: z.string(),
  })).optional(),
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