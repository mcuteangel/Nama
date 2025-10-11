import * as React from "react";
import { cn } from "@/lib/utils";
import { 
  ModernForm,
  ModernFormControl,
  ModernFormDescription,
  ModernFormLabel,
  ModernFormItem,
  ModernFormMessage,
  ModernFormField,
} from "@/components/ui/modern-form";

interface ModernFormItemProps {
  glassEffect?: import("@/types/global-style-types").GlassEffect;
  gradientType?: import("@/types/global-style-types").GradientType;
  neomorphism?: boolean;
}

const Form = ModernForm;

const FormField = ModernFormField;

interface FormItemContextValue {
  id: string;
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ModernFormItemProps
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <ModernFormItem
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = ModernFormLabel;

const FormControl = ModernFormControl;

const FormDescription = ModernFormDescription;

const FormMessage = ModernFormMessage;

export {
  Form,
  FormControl,
  FormDescription,
  FormLabel,
  FormItem,
  FormMessage,
  FormField,
};
