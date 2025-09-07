import * as z from 'zod';

// Define the base object schema first
const baseCustomFieldTemplateSchema = z.object({
  name: z.string().min(1, { message: 'custom_field_template.name_required' }),
  type: z.enum(['text', 'number', 'date', 'list', 'checklist'], { message: 'custom_field_template.type_invalid' }),
  options: z.array(z.string().min(1, { message: 'custom_field_template.option_required' })).optional(),
  description: z.string().optional(),
  required: z.boolean().default(false),
});

// Apply superRefine to the base schema for the full schema
export const customFieldTemplateSchema = baseCustomFieldTemplateSchema.superRefine((data, ctx) => {
  if (data.type === 'list' && (!data.options || data.options.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'custom_field_template.list_options_required',
      path: ['options'],
    });
  }
  if (data.type === 'checklist' && (!data.options || data.options.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'custom_field_template.checklist_options_required',
      path: ['options'],
    });
  }
});

// Create the partial schema from the base object schema
export const updateCustomFieldTemplateSchema = baseCustomFieldTemplateSchema.partial();

export type CreateCustomFieldTemplateInput = z.infer<typeof customFieldTemplateSchema>;
export type UpdateCustomFieldTemplateInput = z.infer<typeof updateCustomFieldTemplateSchema>;
export type CustomFieldTemplate = CreateCustomFieldTemplateInput & { id: string; created_at: string; updated_at: string; user_id: string; };