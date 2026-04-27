"use client";

import React from "react";
import { AlertCircle, ChevronDown, Check } from "lucide-react";

export const baseFieldClasses =
  "w-full h-10 px-3.5 bg-surface border border-border rounded-xl text-xs sm:text-sm text-text placeholder:text-text-subtle font-ui transition-all duration-150 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 disabled:opacity-50 disabled:bg-surface-muted/50 disabled:pointer-events-none";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/** Wraps a control with label + hint + error, wiring aria-describedby/aria-invalid. */
export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  className = "",
  children,
}: FormFieldProps) {
  const hintId = hint ? `${htmlFor || "field"}-hint` : undefined;
  const errorId = error ? `${htmlFor || "field"}-error` : undefined;
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-xs font-semibold text-text font-ui">
        {label}
        {required && (
          <span className="text-danger ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<{
              "aria-invalid"?: boolean;
              "aria-describedby"?: string;
            }>,
            {
              "aria-invalid": error ? true : undefined,
              "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
            }
          )
        : children}
      {hint && !error && (
        <p id={hintId} className="text-[11px] text-text-subtle font-ui">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1 text-[11px] text-danger font-ui">
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", ...rest },
  ref
) {
  return <input ref={ref} className={`${baseFieldClasses} ${className}`} {...rest} />;
});

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = "", ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={`${baseFieldClasses} h-auto min-h-24 py-2.5 resize-y ${className}`}
      {...rest}
    />
  );
});

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Show a placeholder option with this text. */
  placeholder?: string;
  wrapperClassName?: string;
  options?: Array<SelectOption | string>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className = "", placeholder, options, children, wrapperClassName = "", ...rest },
  ref
) {
  return (
    <div className={`relative w-full ${wrapperClassName}`}>
      <select
        ref={ref}
        className={`${baseFieldClasses} pr-9 cursor-pointer appearance-none ${className}`}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options
          ? options.map((opt) => {
              const val = typeof opt === "string" ? opt : opt.value;
              const lbl = typeof opt === "string" ? opt : opt.label;
              return (
                <option key={val} value={val}>
                  {lbl}
                </option>
              );
            })
          : children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-subtle">
        <ChevronDown size={14} />
      </div>
    </div>
  );
});

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  hint?: string;
  description?: string;
}

export function Checkbox({
  label,
  hint,
  description,
  className = "",
  checked,
  id,
  ...rest
}: CheckboxProps) {
  const note = description || hint;

  return (
    <label className={`flex items-start gap-2.5 cursor-pointer select-none ${className}`}>
      <div className="relative flex items-center justify-center mt-0.5">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          className="peer sr-only"
          {...rest}
        />
        <div className="w-4 h-4 rounded-md border border-border bg-surface peer-checked:bg-primary peer-checked:border-primary transition-all duration-150 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-gold/30">
          <Check size={11} className="text-on-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
        </div>
      </div>
      {(label || note) && (
        <div className="space-y-0.5">
          {label && <span className="text-xs font-medium text-text block leading-tight">{label}</span>}
          {note && <span className="text-[11px] text-text-subtle block leading-tight">{note}</span>}
        </div>
      )}
    </label>
  );
}

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = "",
}: SwitchProps) {
  return (
    <label
      className={`flex items-center justify-between gap-3 cursor-pointer select-none ${
        disabled ? "opacity-50 pointer-events-none" : ""
      } ${className}`}
    >
      {(label || description) && (
        <div className="space-y-0.5">
          {label && <span className="text-xs font-semibold text-text block">{label}</span>}
          {description && <span className="text-[11px] text-text-subtle block">{description}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 cursor-pointer ${
          checked ? "bg-primary" : "bg-border-strong"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}