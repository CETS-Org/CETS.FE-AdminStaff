import type { ComponentPropsWithoutRef } from "react";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline";

export type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  variant?: BadgeVariant;
};

function getVariantClasses(variant: BadgeVariant): string {
  switch (variant) {
    case "secondary":
      return "bg-gray-100 text-gray-800 border border-gray-200";
    case "success":
      return "bg-green-100 text-green-800 border border-green-200";
    case "warning":
      return "bg-yellow-100 text-yellow-800 border border-yellow-200";
    case "destructive":
      return "bg-red-100 text-red-800 border border-red-200";
    case "outline":
      return "bg-transparent text-gray-600 border border-gray-300";
    case "default":
    default:
      return "bg-blue-100 text-blue-800 border border-blue-200";
  }
}

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const base = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
  const classes = [base, getVariantClasses(variant), className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}

export default Badge;
