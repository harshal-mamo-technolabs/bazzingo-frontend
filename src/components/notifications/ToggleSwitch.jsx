import React from 'react';

const ToggleSwitch = ({ isOn, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none ${
        isOn ? 'bg-[#FF6B3E]' : 'bg-[#E5E7EB]'
      }`}
      style={{ width: '36px', height: '20px' }}
    >
      <span
        className={`inline-block bg-white rounded-full shadow transform transition-transform duration-200 ${
          isOn ? 'translate-x-4' : 'translate-x-0.5'
        }`}
        style={{ width: '16px', height: '16px' }}
      />
    </button>
  );
};

export default ToggleSwitch;
