import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#6C5CE7',
    colorSuccess: '#00B894',
    colorWarning: '#FDCB6E',
    colorError: '#E17055',
    colorInfo: '#74B9FF',
    borderRadius: 12,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F8F9FE',
  },
  components: {
    Button: {
      borderRadius: 10,
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 16,
    },
    Input: {
      borderRadius: 10,
    },
    Select: {
      borderRadius: 10,
    },
    Menu: {
      borderRadius: 10,
    },
  },
};

export default theme;
