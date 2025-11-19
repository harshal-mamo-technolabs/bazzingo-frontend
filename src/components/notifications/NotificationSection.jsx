import React from 'react';
import NotificationItem from './NotificationItem';
import TranslatedText from '../TranslatedText.jsx';

const NotificationSection = ({ title, notifications, notificationStates, onToggle }) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 className="text-gray-900 text-base" style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600', marginBottom: '12px' }}>
        {typeof title === 'string' ? <TranslatedText text={title} /> : title}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.key}
            notificationKey={notification.key}
            label={notification.label}
            isOn={notificationStates[notification.key]}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationSection;
