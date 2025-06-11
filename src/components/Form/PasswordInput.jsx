import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Input from './Input';

const PasswordInput = React.forwardRef(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={className}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((p) => !p)}
        className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-500"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
  );
});

export default PasswordInput; 