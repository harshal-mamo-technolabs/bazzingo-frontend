import React from 'react';

const IssueTypeCheckbox = ({ type, checked, onChange, label }) => {
  return (
    <label className="flex items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(type)}
        className="border-gray-300 rounded"
        style={{ height: '14px', width: '14px', marginRight: '6px' }}
      />
      <span className="text-gray-700" style={{ fontSize: '12px', fontFamily: 'Roboto, sans-serif' }}>
        {label}
      </span>
    </label>
  );
};

export default IssueTypeCheckbox;
