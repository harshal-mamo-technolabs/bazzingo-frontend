import React from 'react';
import ToggleSwitch from './ToggleSwitch';

const NotificationItem = ({ notificationKey, label, isOn, onToggle }) => {
  return (
    <div className="bg-[#f2f2f2] rounded-lg flex justify-between items-center" style={{ padding: '12px 16px' }}>
      <span className="text-gray-600 text-base" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
        {label}
      </span>
      <ToggleSwitch
        isOn={isOn}
        onToggle={() => onToggle(notificationKey)}
      />
    </div>
  );
};

export default NotificationItem;
