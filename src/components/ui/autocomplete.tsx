import React, { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
interface AutocompleteProps {
  options: { label: string; value: string }[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  isLoading?: boolean;
  className?: string;
}
export function Autocomplete({
  options,
  value,
  onValueChange,
  placeholder = "اختر...",
  emptyText = "لا توجد نتائج.",
  isLoading = false,
  className,
}: AutocompleteProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-12 justify-between px-4 text-right flex-row-reverse bg-muted/50 border-input hover:bg-accent transition-all duration-200",
            className
          )}
        >
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          <span className="truncate flex-1">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="end">
        <Command dir="rtl">
          <CommandInput placeholder="ابحث هنا..." className="h-10 text-right" />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-pharmav-primary" />
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        onValueChange(option.value);
                        setOpen(false);
                      }}
                      className="flex-row-reverse justify-between text-right cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}