"use client";

import { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className = "",
      primaryColor = "#00AF00",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    const variantClasses = {
      primary: "text-white shadow-sm",
      secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
      outline: "border-2 border-current bg-transparent",
      ghost: "bg-transparent hover:bg-gray-100",
    };

    const classes = [
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const style =
      variant === "primary"
        ? {
            backgroundColor: primaryColor,
            "--tw-ring-color": primaryColor,
          }
        : {};

    return (
      <button ref={ref} className={classes} style={style} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
