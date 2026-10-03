"use client";

import { useId, useState } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  suggestions?: string[];
  helperText?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  autoComplete,
  required = true,
  placeholder,
  defaultValue,
  value: controlledValue,
  onChange,
  suggestions,
  helperText,
}: FormFieldProps) {
  const generatedId = useId();
  const datalistId = `${generatedId}-list`;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [showPassword, setShowPassword] = useState(false);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const effectiveType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
          {label}
        </label>
      </div>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={effectiveType}
          autoComplete={autoComplete}
          required={required}
          placeholder={placeholder}
          list={suggestions && suggestions.length > 0 ? datalistId : undefined}
          value={currentValue}
          onChange={(e) => {
            if (!isControlled) {
              setInternalValue(e.target.value);
            }
            onChange?.(e);
          }}
          className="w-full rounded border border-paper-line bg-paper-raised px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint/60 transition-colors focus:border-stamp focus:bg-paper focus:outline-none focus:ring-1 focus:ring-stamp"
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-ink-faint hover:text-ink transition-colors"
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {helperText && (
        <p className="text-[11px] leading-relaxed text-ink-faint">{helperText}</p>
      )}
    </div>
  );
}
