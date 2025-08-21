import * as z from 'zod';

export const customFieldTemplateSchema = z.object({
  name: z.string().min(1, { message: 'نام فیلد نمی‌تواند خالی باشد.' }),
  type: z.enum(['text', 'number', 'date', 'list'], { message: 'نوع فیلد معتبر نیست.' }),
  options: z.array(z.string().min(1, { message: 'گزینه‌های لیست نمی‌توانند خالی باشند.' })).optional(),
  description: z.string().optional(),
  required: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.type === 'list' && (!data.options || data.options.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'برای فیلد از نوع "لیست"، حداقل یک گزینه الزامی است.',
      path: ['options'],
    });
  }
});

export const updateCustomFieldTemplateSchema = customFieldTemplateSchema.partial();

export type CreateCustomFieldTemplateInput = z.infer<typeof customFieldTemplateSchema>;
export type UpdateCustomFieldTemplateInput = z.infer<typeof updateCustomFieldTemplateSchema>;
export type CustomFieldTemplate = CreateCustomFieldTemplateInput & { id: string; created_at: string; updated_at: string; user_id: string; };