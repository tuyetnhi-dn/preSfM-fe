"use client";

type ProjectNameFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function ProjectNameField({
  label,
  placeholder,
  value,
  disabled,
  onChange,
}: ProjectNameFieldProps) {
  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm font-medium text-ink dark:text-slate-100">
        {label}
      </label>

      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-ink outline-none focus:border-ocean disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
    </div>
  );
}
