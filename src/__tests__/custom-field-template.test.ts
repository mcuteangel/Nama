import { describe, it, expect } from 'vitest';
import { customFieldTemplateSchema } from '../domain/schemas/custom-field-template';

describe('CustomFieldTemplate Schema', () => {
  describe('checklist type', () => {
    it('should validate a checklist field with options', () => {
      const checklistField = {
        name: 'Interests',
        type: 'checklist' as const,
        options: ['Sports', 'Music', 'Reading'],
        description: 'Select your interests',
        required: true,
      };

      expect(() => customFieldTemplateSchema.parse(checklistField)).not.toThrow();
    });

    it('should require options for checklist type', () => {
      const checklistField = {
        name: 'Interests',
        type: 'checklist' as const,
        options: [],
        description: 'Select your interests',
        required: true,
      };

      expect(() => customFieldTemplateSchema.parse(checklistField)).toThrow();
    });

    it('should require options for checklist type when options is undefined', () => {
      const checklistField = {
        name: 'Interests',
        type: 'checklist' as const,
        description: 'Select your interests',
        required: true,
      };

      expect(() => customFieldTemplateSchema.parse(checklistField)).toThrow();
    });
  });
});