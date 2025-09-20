import { useCallback, useEffect, useRef } from 'react';
import { UseFormReturn, FieldPath } from 'react-hook-form';
import { ContactFormValues } from '@/types/contact';

interface UseRealTimeValidationProps {
  form: UseFormReturn<ContactFormValues>;
  debounceMs?: number;
}

interface ValidationState {
  isValidating: boolean;
  errors: Record<string, string>;
  touchedFields: Set<string>;
}

export const useRealTimeValidation = ({
  form,
  debounceMs = 500
}: UseRealTimeValidationProps) => {
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const validationStateRef = useRef<ValidationState>({
    isValidating: false,
    errors: {},
    touchedFields: new Set()
  });

  // Debounced validation function
  const validateField = useCallback(async (fieldName: FieldPath<ContactFormValues>) => {
    // Clear any existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Mark field as touched
    validationStateRef.current.touchedFields.add(fieldName);

    // Set validating state
    validationStateRef.current.isValidating = true;

    // Debounce validation
    return new Promise<void>((resolve) => {
      validationTimeoutRef.current = setTimeout(async () => {
        try {
          // Trigger validation for this specific field
          await form.trigger(fieldName);
          
          // Update validation state
          const fieldError = form.formState.errors[fieldName as keyof ContactFormValues];
          if (fieldError) {
            validationStateRef.current.errors[fieldName] = fieldError.message as string;
          } else {
            delete validationStateRef.current.errors[fieldName];
          }
        } catch (error) {
          console.error('Validation error:', error);
        } finally {
          validationStateRef.current.isValidating = false;
          resolve();
        }
      }, debounceMs);
    });
  }, [form, debounceMs]);

  // Validate all fields
  const validateAllFields = useCallback(async () => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    validationStateRef.current.isValidating = true;

    try {
      const isValid = await form.trigger();
      
      if (!isValid) {
        // Update errors from form state
        Object.keys(form.formState.errors).forEach(fieldName => {
          const fieldError = form.formState.errors[fieldName as keyof ContactFormValues];
          if (fieldError) {
            validationStateRef.current.errors[fieldName] = fieldError.message as string;
          }
        });
      } else {
        validationStateRef.current.errors = {};
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      validationStateRef.current.isValidating = false;
    }
  }, [form]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  // Get validation status for a field
  const getFieldValidationStatus = useCallback((fieldName: string) => {
    const isTouched = validationStateRef.current.touchedFields.has(fieldName);
    const hasError = !!validationStateRef.current.errors[fieldName];
    const isValid = isTouched && !hasError && !validationStateRef.current.isValidating;
    
    return {
      isTouched,
      hasError,
      isValid,
      isValidating: validationStateRef.current.isValidating,
      errorMessage: validationStateRef.current.errors[fieldName]
    };
  }, []);

  // Mark field as touched without validation (for onBlur)
  const markFieldAsTouched = useCallback((fieldName: string) => {
    validationStateRef.current.touchedFields.add(fieldName);
  }, []);

  return {
    validateField,
    validateAllFields,
    getFieldValidationStatus,
    markFieldAsTouched,
    isValidating: validationStateRef.current.isValidating,
    errors: validationStateRef.current.errors
  };
};