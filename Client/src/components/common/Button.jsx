import Link from "next/link";
import React from "react";

const Button = ({
  href,
  label,
  children,
  className = "",
  colorClass = "bg-green-primary hover:bg-green-secondary text-white",
  rounded = "rounded-lg",
  onClick,
  type = "button",
  ...rest
}) => {
  const base = "inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium shadow-sm transition disabled:cursor-not-allowed";
  const classes = `${base} ${rounded} ${colorClass} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
        {label ? <span className="flex items-center leading-none">{label}</span> : null}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} {...rest}>
      {children}
      {label ? <span className="flex items-center leading-none">{label}</span> : null}
    </button>
  );
};

export default Button;
