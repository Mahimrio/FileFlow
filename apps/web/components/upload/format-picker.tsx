"use client";

import { useMemo } from "react";
import { FORMATS, FormatCategory, FormatDefinition } from "@repo/shared";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, FileType } from "lucide-react";

interface FormatPickerProps {
  sourceExtension: string;
  onSelect: (targetFormat: string) => void;
}

export function FormatPicker({ sourceExtension, onSelect }: FormatPickerProps) {
  // Determine source category
  const sourceFormat = FORMATS.find(
    (f) => f.id.toLowerCase() === sourceExtension.toLowerCase()
  );
  const sourceCategory: FormatCategory | undefined = sourceFormat?.category;

  // Group formats by category, but filter strictly to the sourceCategory if known
  const groupedFormats = useMemo(() => {
    const groups: Record<string, FormatDefinition[]> = {};
    for (const format of FORMATS) {
      // If we know the source category, strictly restrict to that category
      if (sourceCategory && format.category !== sourceCategory) {
        continue;
      }
      
      // Do not allow converting a format to itself
      if (format.id === sourceFormat?.id) {
        continue;
      }

      if (!groups[format.category]) {
        groups[format.category] = [];
      }
      groups[format.category].push(format);
    }
    return groups;
  }, [sourceCategory, sourceFormat]);

  return (
    <div className="w-full max-w-md mx-auto mt-6 bg-card border rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      <div className="p-4 border-b bg-muted/20 flex items-center gap-3">
        <FileType className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Select target format</p>
          <p className="text-xs text-muted-foreground">
            Convert from <span className="font-bold uppercase">{sourceExtension}</span>
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </div>

      <Command className="rounded-none border-none">
        <CommandInput placeholder="Search formats (e.g. PDF, JPG)..." />
        <CommandList>
          <CommandEmpty>No formats found.</CommandEmpty>
          
          {Object.entries(groupedFormats).map(([category, formats]) => (
            <CommandGroup key={category} heading={category.toUpperCase()}>
              {formats.map((format) => (
                <CommandItem
                  key={format.id}
                  value={`${format.label} ${format.id}`}
                  disabled={!format.phase1}
                  onSelect={() => {
                    if (format.phase1) {
                      onSelect(format.id);
                    }
                  }}
                  className="flex items-center justify-between cursor-pointer py-2"
                >
                  <span className="font-medium">{format.label}</span>
                  {!format.phase1 && (
                    <Badge variant="secondary" className="text-[10px] font-normal px-1.5 bg-muted">
                      Coming soon
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </div>
  );
}
