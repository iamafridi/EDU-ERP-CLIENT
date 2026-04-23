"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger" | "success" | "gold";
  disabled?: boolean;
  divider?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger?: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function ActionMenu({
  items,
  trigger,
  align = "right",
  className = "",
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            aria-label="More actions"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-muted/60 transition-colors cursor-pointer"
          >
            <MoreVertical size={16} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className={`absolute z-50 mt-1 min-w-[170px] rounded-xl bg-surface border border-border shadow-lg py-1.5 focus:outline-none ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {items.map((item, idx) => (
              <React.Fragment key={idx}>
                {item.divider && <div className="my-1 border-t border-border" />}
                <button
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    setIsOpen(false);
                    item.onClick();
                  }}
                  className={`w-full px-3.5 py-2 text-xs flex items-center gap-2.5 transition-colors text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    item.variant === "danger"
                      ? "text-danger hover:bg-danger-soft"
                      : item.variant === "success"
                      ? "text-success hover:bg-success-soft"
                      : item.variant === "gold"
                      ? "text-gold hover:bg-gold-soft"
                      : "text-text hover:bg-surface-muted/60"
                  }`}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span className="font-medium">{item.label}</span>
                </button>
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ActionMenu;
