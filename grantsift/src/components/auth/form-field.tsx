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

  function handleSuggestionClick(suggestion: string) {
    if (!isControlled) {
      setInternalValue(suggestion);
    }
    // Also trigger onChange if provided
    if (onChange) {
      const syntheticEvent = {
        target: { value: suggestion, name },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  }

  const effectiveType = type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wider text-ink-soft">
          {label}
        </label>
        {suggestions && suggestions.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            <span className="text-[11px] text-ink-faint">Suggestions:</span>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="inline-flex items-center rounded bg-paper-raised px-1.5 py-0.5 text-[11px] font-mono font-medium text-stamp-dark border border-paper-line transition-colors hover:border-stamp hover:bg-paper active:scale-95"
                title={`Click to use "${suggestion}"`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
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

      {suggestions && suggestions.length > 0 && (
        <datalist id={datalistId}>
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      )}

      {helperText && (
        <p className="text-[11px] leading-relaxed text-ink-faint">{helperText}</p>
      )}
    </div>
  );
}

