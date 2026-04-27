"use client";

import React, { useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  shortcut?: string;
  wrapperClassName?: string;
}

const sizeClasses = {
  sm: "h-9 pl-8 pr-8 text-xs rounded-lg",
  md: "h-10 pl-9 pr-9 text-xs sm:text-sm rounded-xl",
  lg: "h-11 pl-10 pr-10 text-sm rounded-xl",
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 18,
};

export function SearchInput({
  value,
  onChange,
  onValueChange,
  onClear,
  size = "md",
  loading = false,
  shortcut,
  placeholder = "Search records...",
  className = "",
  wrapperClassName = "",
  disabled = false,
  ...rest
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    onValueChange?.(e.target.value);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      const event = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(event);
      onValueChange?.("");
    }
    inputRef.current?.focus();
  };

  return (
    <div className={`relative flex items-center w-full ${wrapperClassName}`}>
      {/* Search Icon or Loading Spinner */}
      <div className="absolute left-3 flex items-center pointer-events-none text-text-subtle">
        {loading ? (
          <Loader2 size={iconSizes[size]} className="animate-spin text-gold" />
        ) : (
          <Search size={iconSizes[size]} />
        )}
      </div>

      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-surface border border-border text-text placeholder:text-text-subtle font-ui transition-all duration-200 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 disabled:opacity-50 disabled:bg-surface-muted/50 ${sizeClasses[size]} ${className}`}
        {...rest}
      />

      {/* Right Controls: Clear button or Keyboard Shortcut */}
      <div className="absolute right-2.5 flex items-center gap-1.5">
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-md text-text-subtle hover:text-text hover:bg-surface-muted transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <X size={iconSizes[size] - 2} />
          </button>
        ) : shortcut ? (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-text-subtle bg-surface-muted border border-border rounded">
            {shortcut}
          </kbd>
        ) : null}
      </div>
    </div>
  );
}

export default SearchInput;
