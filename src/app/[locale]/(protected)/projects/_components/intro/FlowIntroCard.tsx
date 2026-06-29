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
      ? "rounded-xl border-border-base bg-bg-panel px-4 py-3 dark:border-border-base dark:bg-panel"
      : "rounded-xl border-border-base bg-bg-panel px-4 py-3 dark:border-border-base dark:bg-bg-panel";

  const titleClassName =
    variant === "raw" ? "text-sm font-semibold" : "text-sm font-semibold";

  const descriptionClassName =
    variant === "raw" ? "mt-1 text-xs" : "mt-1 text-xs";

  return (
    <div className={className}>
      <h3 className={titleClassName}>{title}</h3>

      <p className={descriptionClassName}>{description}</p>
    </div>
  );
}
