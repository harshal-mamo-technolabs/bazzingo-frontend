import React from 'react';
import { useLocation } from 'react-router-dom';

const AuthLayout = ({ children, illustration, responsiveIllustration }) => {
   const location = useLocation();
  const path = location.pathname;

  // Determine background color based on the current path
  let bgColor = '#ffffff'; // default
  if (path === '/login') {
    bgColor = '#ffb7a2';
  } else if (path === '/signup') {
    bgColor = '#f7bba9';
  } else if (path === '/forgot-password' || path.startsWith('/forgot-password/')) {
    bgColor = '#f8eed5';
  }


  return (
    <div className="relative w-screen h-screen bg-white overflow-hidden">
      {/* Responsive Image: only for small screens */}
      <div className="absolute top-0 left-0 w-full h-[360px] lg:hidden z-0 flex justify-center" style={{ backgroundColor: bgColor }}>
      <img
      src={responsiveIllustration}
      alt="Auth Illustration"
      className="w-[240px] h-[260px] object-contain"
      style={{
      marginTop: '0px',
      }}/>
      </div>


      {/* Centered Card */}
      <div className="relative z-10 flex justify-center items-start lg:items-center pt-[195px] lg:pt-4 w-full h-full">
        <div
          className="box-border flex flex-col lg:flex-row lg:items-center p-4 lg:w-[1228px] lg:h-[751px] w-[95%] h-full bg-white lg:border border-gray-200 rounded-3xl shadow-none lg:shadow-2xl lg:scale-[0.7]"
          
        >
          <div className="flex-1">
            <div
              className="flex flex-col justify-center items-center lg:gap-11 mx-auto lg:w-[496px] w-full"
            >
              {children}
            </div>
          </div>
          {/* Desktop illustration */}
          <div className="hidden lg:flex md:ml-5 h-full flex-1">{illustration}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
