import React, { useId } from 'react';

const Input = React.forwardRef(function Input({
    label,
    type = "text",
    className = "",
    ...props
}, ref) {
    const id = useId();
    return (
        <div>
            {label && <label htmlFor={id} className='block text-sm font-medium text-gray-700'>{label}</label>}
            <input type={type} className={`${className}`} ref={ref} {...props} id={id} />
        </div>
    );
});

export default Input;
