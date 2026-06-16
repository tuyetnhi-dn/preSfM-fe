"use client";

type FlowIntroCardProps = {
  title: string;
  description: string;
  variant: "raw" | "processed";
};

export function FlowIntroCard({
  title,
  description,
  variant,
}: FlowIntroCardProps) {
  const className =
    variant === "raw"
      ? "rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950/30"
      : "rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-900 dark:bg-purple-950/30";

  const titleClassName =
    variant === "raw"
      ? "text-sm font-semibold text-blue-700 dark:text-blue-300"
      : "text-sm font-semibold text-purple-700 dark:text-purple-300";

  const descriptionClassName =
    variant === "raw"
      ? "mt-1 text-xs text-blue-700/80 dark:text-blue-300/80"
      : "mt-1 text-xs text-purple-700/80 dark:text-purple-300/80";

  return (
    <div className={className}>
      <h3 className={titleClassName}>{title}</h3>

      <p className={descriptionClassName}>{description}</p>
    </div>
  );
}
