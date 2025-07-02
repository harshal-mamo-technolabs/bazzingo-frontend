import React from 'react';

const SaveButton = ({ onSave }) => {
  return (
    <button
      onClick={onSave}
      className="w-full sm:w-auto bg-[#FF6B3E] rounded-lg text-white border-none hover:bg-[#e55a35] transition-colors mb-2 duration-200 flex items-center justify-center text-sm lg:text-base"
      style={{
        height: '32px',
        fontFamily: 'Roboto, sans-serif',
        fontWeight: '300',
        fontSize: '14px',
        padding: '20px 20px',
      }}
    >
      Save Preferences
    </button>
  );
};

export default SaveButton;
