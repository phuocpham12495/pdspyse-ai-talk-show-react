import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import enUS from 'antd/locale/en_US';
import { router } from './routes';
import { lightTheme, darkTheme } from './theme';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const theme = useSettingsStore((s) => s.theme);
  const language = useSettingsStore((s) => s.language);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ConfigProvider
      theme={theme === 'dark' ? darkTheme : lightTheme}
      locale={language === 'en' ? enUS : viVN}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
