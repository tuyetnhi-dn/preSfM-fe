"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type EntityCardMetaItem = {
  icon?: ReactNode;
  value: ReactNode;
};

type EntityCardProps = {
  href?: string;

  coverImageUrl?: string | null;
  coverIcon: ReactNode;
  coverStatusIcons?: ReactNode;

  title: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;

  metaItems?: EntityCardMetaItem[];

  footerLeft?: ReactNode;
  footerRight?: ReactNode;
};

export function EntityCard({
  href,
  coverImageUrl,
  coverIcon,
  coverStatusIcons,
  title,
  subtitle,
  description,
  metaItems = [],
  footerLeft,
  footerRight,
}: EntityCardProps) {
  const content = (
    <article className="h-full overflow-hidden rounded-2xl border border-[var(--border-base)] bg-[var(--bg-panel)] transition hover:border-[var(--border-hover)] hover:shadow-md">
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-[var(--bg-hover)] text-[var(--text-muted)]">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={typeof title === "string" ? title : "Project cover"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          coverIcon
        )}

        {coverStatusIcons ? (
          <div className="absolute right-2 top-2 flex items-center gap-1">
            {coverStatusIcons}
          </div>
        ) : null}
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold text-[var(--text-base)]">
            {title}
          </h3>

          {subtitle ? (
            <p className="mt-1 line-clamp-1 text-xs text-[var(--text-muted)]">
              {subtitle}
            </p>
          ) : null}

          {description ? (
            <p className="mt-2 line-clamp-2 text-sm text-[var(--text-muted)]">
              {description}
            </p>
          ) : null}
        </div>

        {metaItems.length > 0 ? (
          <div className="space-y-2">
            {metaItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-xs text-[var(--text-muted)]"
              >
                {item.icon}
                <span className="line-clamp-1">{item.value}</span>
              </div>
            ))}
          </div>
        ) : null}

        {footerLeft || footerRight ? (
          <div className="flex items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <div className="min-w-0">{footerLeft}</div>
            <div className="shrink-0">{footerRight}</div>
          </div>
        ) : null}
      </div>
    </article>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
    >
      {content}
    </Link>
  );
}
