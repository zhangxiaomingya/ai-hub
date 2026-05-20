import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "btn-glow text-white font-semibold",
        secondary: "bg-surface-2 text-foreground border border-border hover:border-primary/40 hover:bg-surface",
        outline: "border border-border bg-transparent text-foreground hover:border-primary/50 hover:bg-surface",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-surface",
        glow: "btn-glow text-white font-semibold shadow-glow-md",
        tab: "rounded-full border border-transparent text-muted-foreground hover:text-foreground hover:bg-surface",
        tabActive: "rounded-full border border-primary/40 bg-primary/10 text-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base",
        icon: "h-9 w-9",
        xs: "h-6 px-2 text-xs rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
)
Button.displayName = "Button"

export { Button, buttonVariants }
