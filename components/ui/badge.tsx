import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Status colors per the dataviz skill's fixed status palette — reserved for
// state (good/warning/critical), never re-themed to match a brand accent,
// and never reused as a generic "series 4" color.
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 [&>svg]:pointer-events-none transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-accent/10 text-accent",
        outline: "border-border bg-transparent text-foreground",
        success: "border-transparent bg-[#0ca30c]/10 text-[#0ca30c]",
        warning: "border-transparent bg-[#fab219]/15 text-[#92650c]",
        critical: "border-transparent bg-[#d03b3b]/10 text-[#d03b3b]",
        neutral: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
