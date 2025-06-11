import React from 'react';

const AuthLayout = ({ children, illustration }) => {
  return (
    <div className="flex justify-center pt-4 w-screen h-screen overflow-hidden bg-white">
      <div
        className="box-border flex flex-col md:flex-row items-center p-8 bg-white border border-gray-200 rounded-3xl shadow-2xl"
        style={{ width: '1228px', height: '751px', transform: 'scale(0.7)' }}
      >
        <div className="flex-1">
          <div
            className="flex flex-col justify-center items-center gap-11 mx-auto"
            style={{ width: '496px' }}
          >
            {children}
          </div>
        </div>
        {illustration}
      </div>
    </div>
  );
};

export default AuthLayout; 