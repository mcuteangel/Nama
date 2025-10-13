import i18n from '@/integrations/i18n';

export const getValidationMessage = (key: string, field?: string): string => {
  return i18n.t(`validation.${key}`, { field: field ? i18n.t(`fields.${field}`) : '' });
};

export const validation = {
  required: (field: string) => ({
    message: getValidationMessage('required', field)
  }),
  email: {
    message: getValidationMessage('email')
  },
  url: {
    message: getValidationMessage('url')
  },
  phone: {
    message: getValidationMessage('phone')
  },
  gender: {
    message: getValidationMessage('gender')
  },
  preferredContactMethod: {
    message: getValidationMessage('preferredContactMethod')
  }
};
