"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

const baseFieldClasses =
  "w-full h-10 px-3 bg-surface border border-border-strong rounded-md text-sm text-text placeholder:text-text-subtle transition-all duration-150 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none";

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
export function FormField({ label, htmlFor, required, hint, error, className = "", children }: FormFieldProps) {
  const hintId = hint ? `${htmlFor || "field"}-hint` : undefined;
  const errorId = error ? `${htmlFor || "field"}-error` : undefined;
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="block text-xs font-medium text-text">
        {label}
        {required && (
          <span className="text-danger ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<{ "aria-invalid"?: boolean; "aria-describedby"?: string }>, {
            "aria-invalid": error ? true : undefined,
            "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
          })
        : children}
      {hint && !error && (
        <p id={hintId} className="text-[11px] text-text-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="flex items-center gap-1 text-[11px] text-danger">
          <AlertCircle size={12} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...rest }: InputProps) {
  return <input className={`${baseFieldClasses} ${className}`} {...rest} />;
}

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className = "", ...rest }: TextareaProps) {
  return <textarea className={`${baseFieldClasses} h-auto min-h-24 py-2.5 resize-y ${className}`} {...rest} />;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Show a placeholder option with this text. */
  placeholder?: string;
}

export function Select({ className = "", placeholder, children, ...rest }: SelectProps) {
  return (
    <select className={`${baseFieldClasses} pr-8 cursor-pointer appearance-none ${className}`} {...rest}>
      {placeholder && <option value="" disabled hidden>{placeholder}</option>}
      {children}
    </select>
  );
}