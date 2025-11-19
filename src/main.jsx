import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import store from './app/store.js';
import router from './routes.jsx';
import { checkAndValidateToken } from './app/userSlice';
import { I18nProvider } from './context/I18nContext.jsx';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

store.dispatch(checkAndValidateToken());

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    const { type, payload } = event?.data || {};

    if (!type) return;

    switch (type) {
      case 'PUSH_RECEIVED':
        console.log('[App] PUSH_RECEIVED:', payload);
        break;
      case 'PUSH_SHOWN':
        console.log('[App] PUSH_SHOWN:', payload);
        break;
      case 'PUSH_SHOWN_COUNT':
        console.log('[App] PUSH_SHOWN_COUNT:', payload);
        break;
      case 'PUSH_ERROR':
        console.error('[App] PUSH_ERROR:', payload);
        break;
      default:
        break;
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <I18nProvider>
          <RouterProvider router={router} />
          <Toaster />
        </I18nProvider>
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>
);