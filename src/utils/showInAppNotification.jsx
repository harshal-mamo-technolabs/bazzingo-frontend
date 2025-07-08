import { toast } from 'react-hot-toast';

export function showInAppNotification(notification) {
  toast.custom((t) => (
    <div
      onClick={() => {
        if (notification.url) {
          window.location.href = notification.url;
        }
        toast.dismiss(t.id);
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: notification.url ? 'pointer' : 'default',
        maxWidth: '400px',
        width: '100%',
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      <img
        src="http://localhost:5173/beep.png"
        alt="Notification"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '4px',
          objectFit: 'cover',
          marginRight: '12px',
          border: '1px solid red'
        }}
      />
      <div>
        <strong>{notification.title}</strong>
        <div style={{ marginTop: '4px', color: '#555' }}>
          {notification.message}
        </div>
      </div>
    </div>
  ), {
    duration: 5000,
    position: 'top-right',
  });
}
