import type { ThemeConfig } from 'antd';
import { theme as antdTheme } from 'antd';

const baseTheme: ThemeConfig = {
  token: {
    colorPrimary: '#6C5CE7',
    colorSuccess: '#00B894',
    colorWarning: '#FDCB6E',
    colorError: '#E17055',
    colorInfo: '#74B9FF',
    borderRadius: 12,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 14,
  },
  components: {
    Button: { borderRadius: 10, controlHeight: 40 },
    Card: { borderRadiusLG: 16 },
    Input: { borderRadius: 10 },
    Select: { borderRadius: 10 },
    Menu: { borderRadius: 10 },
  },
};

export const lightTheme: ThemeConfig = {
  ...baseTheme,
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    ...baseTheme.token,
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F8F9FE',
  },
};

export const darkTheme: ThemeConfig = {
  ...baseTheme,
  algorithm: antdTheme.darkAlgorithm,
  token: {
    ...baseTheme.token,
  },
};

export default lightTheme;
