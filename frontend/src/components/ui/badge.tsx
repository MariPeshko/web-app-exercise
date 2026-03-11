import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border-2 border-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all overflow-hidden shadow-[2px_2px_0px_0px_#000000]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground rounded-none [a&]:hover:translate-x-[-1px] [a&]:hover:translate-y-[-1px] [a&]:hover:shadow-[3px_3px_0px_0px_#000000]",
        secondary:
          "bg-secondary text-secondary-foreground rounded-none [a&]:hover:translate-x-[-1px] [a&]:hover:translate-y-[-1px] [a&]:hover:shadow-[3px_3px_0px_0px_#000000]",
        destructive:
          "bg-pink text-white rounded-none [a&]:hover:translate-x-[-1px] [a&]:hover:translate-y-[-1px] [a&]:hover:shadow-[3px_3px_0px_0px_#000000]",
        outline:
          "bg-background text-foreground rounded-full [a&]:hover:bg-muted",
        ghost: "border-transparent shadow-none [a&]:hover:bg-muted",
        link: "text-primary underline-offset-4 border-transparent shadow-none [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
