"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// Simplified Switch using standard checkbox input but styled
const Switch = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <div className="relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 has-[:checked]:bg-primary bg-input">
    <input type="checkbox" className="peer sr-only" ref={ref} {...props} />
    <span className="pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform peer-checked:translate-x-5" />
  </div>
));
Switch.displayName = "Switch";

export { Switch };
