interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}

export function FormField({ label, name, type = "text", autoComplete, required = true }: FormFieldProps) {
  return (
    <label className="block">
      <span className="text-sm text-ink-soft">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="mt-1.5 w-full border border-paper-line bg-paper-raised px-3 py-2 text-ink outline-none focus:border-stamp"
      />
    </label>
  );
}
