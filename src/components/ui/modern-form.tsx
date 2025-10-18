import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { cn, applyGlassEffect, applyGradientEffect, applyNeomorphismEffect } from "@/lib/utils";
import { GlassEffect, GradientType } from "@/types/global-style-types";
import { Label } from "@/components/ui/label";

const ModernForm = FormProvider;

interface ModernFormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
}

const ModernFormFieldContext = React.createContext<ModernFormFieldContextValue>(
  {} as ModernFormFieldContextValue
);

const ModernFormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <ModernFormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </ModernFormFieldContext.Provider>
  );
};

const useModernFormField = () => {
  const fieldContext = React.useContext(ModernFormFieldContext);
  const itemContext = React.useContext(ModernFormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  const { t } = useTranslation();
  
  if (!fieldContext) {
    throw new Error(t('form.hook_usage_error'));
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

interface ModernFormItemContextValue {
  id: string;
}

const ModernFormItemContext = React.createContext<ModernFormItemContextValue>(
  {} as ModernFormItemContextValue
);

const ModernFormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    glassEffect?: GlassEffect;
    gradientType?: GradientType;
    neomorphism?: boolean;
  }
>(({ 
  className, 
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  ...props 
}, ref) => {
  const id = React.useId();
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <ModernFormItemContext.Provider value={{ id }}>
      <div
        ref={ref}
        className={cn(
          "space-y-2",
          shouldApplyGlass && applyGlassEffect(undefined, { variant: glassEffect }),
          shouldApplyNeomorphism && applyNeomorphismEffect(undefined),
          shouldApplyGradient && applyGradientEffect(undefined, gradientType),
          className,
        )}
        {...props}
      />
    </ModernFormItemContext.Provider>
  );
});
ModernFormItem.displayName = "ModernFormItem";

const ModernFormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <Label
    ref={ref}
    className={cn(className)}
    {...props}
  />
));
ModernFormLabel.displayName = "ModernFormLabel";

const ModernFormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useModernFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
ModernFormControl.displayName = "ModernFormControl";

const ModernFormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    glassEffect?: GlassEffect;
    gradientType?: GradientType;
    neomorphism?: boolean;
  }
>(({ 
  className, 
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  ...props 
}, ref) => {
  const { formDescriptionId } = useModernFormField();
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn(
        "text-sm text-muted-foreground",
        shouldApplyGlass && applyGlassEffect(undefined, { variant: glassEffect }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined),
        shouldApplyGradient && applyGradientEffect(undefined, gradientType),
        className,
      )}
      {...props}
    />
  );
});
ModernFormDescription.displayName = "ModernFormDescription";

const ModernFormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    glassEffect?: GlassEffect;
    gradientType?: GradientType;
    neomorphism?: boolean;
  }
>(({ 
  className, 
  glassEffect = "none",
  gradientType = "none",
  neomorphism = false,
  children, 
  ...props 
}, ref) => {
  const { error, formMessageId } = useModernFormField();
  const shouldApplyGlass = glassEffect !== "none";
  const shouldApplyGradient = gradientType !== "none";
  const shouldApplyNeomorphism = neomorphism;
  
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn(
        "text-sm font-medium text-destructive",
        shouldApplyGlass && applyGlassEffect(undefined, { variant: glassEffect }),
        shouldApplyNeomorphism && applyNeomorphismEffect(undefined),
        shouldApplyGradient && applyGradientEffect(undefined, gradientType),
        className,
      )}
      {...props}
    >
      {body}
    </p>
  );
});
ModernFormMessage.displayName = "ModernFormMessage";

export {
  ModernForm,
  ModernFormControl,
  ModernFormDescription,
  ModernFormLabel,
  ModernFormItem,
  ModernFormMessage,
  ModernFormField,
};