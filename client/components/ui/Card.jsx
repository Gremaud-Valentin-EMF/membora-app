"use client";

const Card = ({ children, className = "", ...props }) => {
  const classes = ["bg-white rounded-lg shadow-md p-6", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
