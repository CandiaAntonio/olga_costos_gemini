import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-none text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black disabled:pointer-events-none disabled:opacity-50 tracking-widest uppercase";

    const variants = {
      default: "bg-black text-white hover:bg-gray-800",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline:
        "border border-black bg-white text-black hover:bg-black hover:text-white",
      secondary: "bg-gray-100 text-black hover:bg-gray-200",
      ghost: "hover:bg-gray-100 text-black",
      link: "text-black underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-10 px-6 py-2",
      sm: "h-9 px-4",
      lg: "h-12 px-8",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        style={{ fontFamily: "Cormorant, serif", letterSpacing: "0.15em" }}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
