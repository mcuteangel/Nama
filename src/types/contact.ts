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
  gender: z.enum(["male", "female", "not_specified"], { message: "جنسیت معتبر نیست." }).default("not_specified"),
  position: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  groupId: z.string().optional(),
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