// src/components/form/PasswordField.tsx

"use client";

import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes, useId, useState } from "react";

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  error?: string;
  containerClassName?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
};

export function PasswordField({
  id,
  label,
  value,
  onValueChange,
  error,
  disabled,
  className,
  containerClassName,
  showPasswordLabel = "Show password",
  hidePasswordLabel = "Hide password",
  autoComplete = "new-password",
  ...inputProps
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  const [visible, setVisible] = useState(false);

  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          {...inputProps}
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={[
            "password-input w-full rounded-lg border px-3 py-2 pr-11 outline-none disabled:cursor-not-allowed disabled:opacity-60",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-slate-300 focus:border-brand focus:ring-1 focus:ring-brand",
            className ?? "",
          ].join(" ")}
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label={visible ? hidePasswordLabel : showPasswordLabel}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
