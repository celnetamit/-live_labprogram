"use client";

/**
 * The editor toolbar's shared button styling.
 *
 * In its own module so the toolbar and the image picker cannot drift apart —
 * having the picker import them from the toolbar would be a cycle, since the
 * toolbar renders the picker.
 */

export const TOOL =
  "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent";

export const TOOL_ON = "inline-flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-foreground";

export function Tool({
  title,
  onClick,
  active,
  disabled,
  children,
}: {
  title: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={active ? TOOL_ON : TOOL}
    >
      {children}
    </button>
  );
}

export function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-border" />;
}
