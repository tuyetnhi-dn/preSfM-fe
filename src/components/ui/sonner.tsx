"use client";

import type { CSSProperties } from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      offset="16px"
      className="toaster group z-[9999] rounded-lg"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--bg-base)",
          "--normal-text": "var(--text-base)",
          "--normal-border": "var(--border-base)",
          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast rounded-lg border border-[var(--border-base)] bg-bg-base text-[var(--text-base)] shadow-lg",
          description: "text-[var(--text-muted)]",
          actionButton:
            "bg-[var(--brand)] text-[var(--brand-text)] hover:bg-[var(--brand-hover)]",
          cancelButton:
            "bg-[var(--bg-hover)] text-[var(--text-base)] hover:bg-[var(--bg-muted)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
