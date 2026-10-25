import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import AdminApp from '@/components/AdminApp';
import AppointmentStatusPage from '@/components/AppointmentStatus';
import GalleryPage from '@/components/GalleryPage';
import PublicSite from '@/components/PublicSite';
import OAuthCallback from '@/pages/oauth/OAuthCallback';
import { LanguageProvider } from '@/context/LanguageContext';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const normalizedPath = currentPath.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/oauth/callback') {
    return <OAuthCallback />;
  }
  if (normalizedPath === '/admin' || normalizedPath.startsWith('/admin/')) {
    return (
      <motion.div
        key="admin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <AdminApp />
      </motion.div>
    );
  }

  if (normalizedPath === '/gallery') {
    return (
      <LanguageProvider>
        <motion.div
          key="gallery"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full min-h-screen"
        >
          <GalleryPage />
        </motion.div>
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <motion.div
        key={normalizedPath}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full min-h-screen"
      >
        {normalizedPath === '/appointment-status' ? <AppointmentStatusPage /> : <PublicSite />}
      </motion.div>
    </LanguageProvider>
  );
}
