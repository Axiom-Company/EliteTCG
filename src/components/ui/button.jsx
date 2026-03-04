import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[0.9375rem] font-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#3ECF8E] text-[#0f0f0f] font-medium hover:bg-[#2db87a]",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-[#282828] bg-transparent text-[#c4c4c4] hover:bg-[#1e1e1e] hover:text-[#f1f1f1]",
        secondary: "bg-[#1e1e1e] text-[#c4c4c4] hover:bg-[#282828]",
        ghost: "text-[#6b6b6b] hover:bg-[#1e1e1e] hover:text-[#f1f1f1]",
        link: "text-[#3ECF8E] underline-offset-4 hover:underline",
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
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
