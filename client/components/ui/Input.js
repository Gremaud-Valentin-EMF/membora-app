"use client";

import { forwardRef } from "react";

const Input = forwardRef(
  (
    { label, error, className = "", primaryColor = "#00AF00", ...props },
    ref
  ) => {
    const baseClasses =
      "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200";
    const stateClasses = error
      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-gray-500 focus:ring-gray-500";

    const classes = [baseClasses, stateClasses, className]
      .filter(Boolean)
      .join(" ");

    const style = {
      "--tw-ring-color": primaryColor,
    };

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input ref={ref} className={classes} style={style} {...props} />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
