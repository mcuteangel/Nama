import { type DialogProps } from "@radix-ui/react-dialog";

import { 
  ModernCommand, 
  ModernCommandDialog, 
  ModernCommandInput, 
  ModernCommandList, 
  ModernCommandEmpty, 
  ModernCommandGroup, 
  ModernCommandItem, 
  ModernCommandShortcut, 
  ModernCommandSeparator 
} from "@/components/ui/modern-command";

const Command = ModernCommand;

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <ModernCommandDialog {...props}>
      <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
        {children}
      </Command>
    </ModernCommandDialog>
  );
};

const CommandInput = ModernCommandInput;

const CommandList = ModernCommandList;

const CommandEmpty = ModernCommandEmpty;

const CommandGroup = ModernCommandGroup;

const CommandSeparator = ModernCommandSeparator;

const CommandItem = ModernCommandItem;

const CommandShortcut = ModernCommandShortcut;

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
