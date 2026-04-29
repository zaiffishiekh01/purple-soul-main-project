import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState, ReactNode } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSectionProps {
  title: string;
  options?: FilterOption[];
  selectedValues?: string[];
  onToggle?: (value: string) => void;
  defaultOpen?: boolean;
  isOpen?: boolean;
  children?: ReactNode;
}

export function FilterSection({
  title,
  options,
  selectedValues = [],
  onToggle,
  defaultOpen = true,
  isOpen: controlledIsOpen,
  children
}: FilterSectionProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  return (
    <div className="border-b border-default pb-7 mb-7">
      <button
        onClick={() => setInternalIsOpen(!internalIsOpen)}
        className="flex items-center justify-between w-full py-2 text-left group"
      >
        <h3 className="font-semibold text-primary text-base">{title}</h3>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted group-hover:text-secondary transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted group-hover:text-secondary transition-colors" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-3 mt-5">
          {children ? (
            children
          ) : options && onToggle ? (
            options.map(option => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer hover:bg-surface-deep px-1 py-0.5 -mx-1 rounded transition-colors group"
                style={{ lineHeight: '1.4' }}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => onToggle(option.value)}
                  className="w-4 h-4 text-purple-600 border-default rounded focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-secondary group-hover:text-primary transition-colors">{option.label}</span>
              </label>
            ))
          ) : null}
        </div>
      )}
    </div>
  );
}
