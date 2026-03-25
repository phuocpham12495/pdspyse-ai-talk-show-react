import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { router } from './routes';
import theme from './theme';
import { useAuthStore } from '../stores/authStore';

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ConfigProvider theme={theme} locale={viVN}>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
