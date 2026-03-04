import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-lg border border-[#282828] bg-[#111111] px-3 py-2 text-sm text-[#f1f1f1] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#4a4a4a] focus-visible:outline-none focus-visible:border-[#3ECF8E] focus-visible:ring-1 focus-visible:ring-[#3ECF8E]/30 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
