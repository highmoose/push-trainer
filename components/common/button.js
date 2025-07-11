import React from "react";

export default function Button({
  onClick,
  children,
  className = "",
  variant = "primary",
  size = "medium",
  disabled = false,
  type = "button",
  ...props
}) {
  const baseClasses = "rounded-full transition-transform duration-0 ";

  const variants = {
    primary:
      "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:translate-y-0.5 ",
    secondary: "bg-white text-zinc-900 active:translate-y-0.5 ",
    outline:
      "border border-zinc-300 text-zinc-700 hover:bg-zinc-50 active:translate-y-0.5 ",
    ghost: "text-zinc-700 hover:bg-zinc-100 active:translate-y-0.5 ",
    danger: "bg-red-600 text-white hover:bg-red-700 active:translate-y-0.5",
  };

  const sizes = {
    small: "px-3 py-1.5 text-xs",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  const disabledClasses = "opacity-50 cursor-not-allowed";

  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${disabled ? disabledClasses : ""}
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
}
