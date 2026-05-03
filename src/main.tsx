import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './store/useAuthStore';
import { Toaster } from 'sonner';
import AiChatbot from '@/components/ai/AiChatbot';
import './index.css';

function App() {
  const user = useAuthStore((s) => s.user);
  return (
    <>
      <RouterProvider router={router} />
      {user && <AiChatbot />}
      <Toaster position="top-right" richColors />
    </>
  );
}

useAuthStore.getState().fetchUser().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});