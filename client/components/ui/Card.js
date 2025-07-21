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

const CardHeader = ({ children, className = "", ...props }) => {
  const classes = ["pb-4", className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = "", ...props }) => {
  const classes = ["text-xl font-semibold text-gray-900", className]
    .filter(Boolean)
    .join(" ");
  return (
    <h3 className={classes} {...props}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className = "", ...props }) => {
  const classes = ["text-sm text-gray-600", className]
    .filter(Boolean)
    .join(" ");
  return (
    <p className={classes} {...props}>
      {children}
    </p>
  );
};

const CardContent = ({ children, className = "", ...props }) => {
  const classes = ["pt-0", className].filter(Boolean).join(" ");
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Attacher les sous-composants au composant principal
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;

export default Card;
