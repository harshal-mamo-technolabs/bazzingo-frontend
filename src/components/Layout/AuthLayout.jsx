import React from 'react';

const AuthLayout = ({ children, illustration, responsiveIllustration }) => {
  return (
    <div className="relative w-screen h-screen bg-white overflow-hidden">
      {/* Responsive Image: only for small screens */}
      <div className="absolute top-0 left-0 w-full h-full md:hidden z-0">
        <img
          src={responsiveIllustration}
          alt="Auth Illustration"
          className="w-full object-contain mx-auto"
          style={{
            maxWidth: '420px',
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      {/* Centered Card */}
      <div className="relative z-10 flex justify-center items-start md:items-center pt-[165px] md:pt-4 w-full h-full">
        <div
          className="box-border flex flex-col md:flex-row items-center p-8 bg-white md:border border-gray-200 rounded-3xl shadow-none md:shadow-2xl md:scale-[0.7] scale-[0.61]"
          style={{
            width: '1228px',
            height: '751px',
          }}
        >
          <div className="flex-1">
            <div
              className="flex flex-col justify-center items-center gap-11 mx-auto"
              style={{ width: '496px' }}
            >
              {children}
            </div>
          </div>
          {/* Desktop illustration */}
          <div className="hidden md:flex h-full flex-1">{illustration}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
