import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "relative overflow-hidden rounded-lg bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 text-zinc-300 shadow-lg shadow-black/20 backdrop-blur-sm hover:text-zinc-100 border border-zinc-800/50 hover:border-zinc-700/50",
        destructive: "relative overflow-hidden rounded-lg bg-gradient-to-b from-red-500/90 to-red-600/90 text-white shadow-lg shadow-black/20 backdrop-blur-sm hover:from-red-500/80 hover:to-red-600/80 border border-red-500/50 hover:border-red-400/50",
        outline: "relative overflow-hidden rounded-lg border border-zinc-800/50 bg-zinc-900/50 text-zinc-300 backdrop-blur-sm hover:bg-zinc-800/50 hover:text-zinc-100 hover:border-zinc-700/50",
        secondary: "relative overflow-hidden rounded-lg bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 text-zinc-300 shadow-lg shadow-black/20 backdrop-blur-sm hover:text-zinc-100 border border-zinc-800/50 hover:border-zinc-700/50",
        ghost: "rounded-lg text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100",
        link: "text-zinc-300 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
