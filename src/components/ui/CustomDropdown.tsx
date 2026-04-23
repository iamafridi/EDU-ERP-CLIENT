"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchable = false,
  className = "",
  icon,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = searchable && search
    ? options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-3 bg-surface border border-border rounded-xl text-xs font-semibold text-text flex items-center justify-between gap-2 hover:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold transition-all cursor-pointer shadow-xs min-w-[140px]"
      >
        <div className="flex items-center gap-1.5 truncate">
          {icon && <span className="text-text-muted shrink-0">{icon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate">{selectedOption?.label || placeholder}</span>
        </div>
        <ChevronDown size={14} className={`text-text-muted transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 mt-1.5 w-full min-w-[180px] bg-surface border border-border rounded-xl shadow-lg py-1.5 focus:outline-none overflow-hidden"
          >
            {searchable && (
              <div className="px-2 pb-1.5 border-b border-border mb-1">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-muted/50 rounded-lg text-xs">
                  <Search size={13} className="text-text-muted" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent text-text text-xs focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-60 overflow-y-auto no-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-text-muted text-center">No options found</div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer text-left ${
                        isSelected
                          ? "bg-gold-soft text-gold font-bold"
                          : "text-text hover:bg-surface-muted/50 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                        <span className="truncate">{opt.label}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {opt.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface-muted text-text-muted">
                            {opt.badge}
                          </span>
                        )}
                        {isSelected && <Check size={14} className="text-gold" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CustomDropdown;
