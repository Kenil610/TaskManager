import React from 'react';

function Button({
    children,
    type = 'button',
    className = "",
    ...props
}) {
  return (
    <button className={`${className}`} {...props}>
        {children}
    </button>
  );
}

export default Button;
