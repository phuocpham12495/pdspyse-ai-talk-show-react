import { useState } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Button, Tag } from 'antd';
import {
  HomeOutlined,
  PlayCircleOutlined,
  UserOutlined,
  TeamOutlined,
  GlobalOutlined,
  LogoutOutlined,
  MenuOutlined,
  WifiOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useSettingsStore } from '../../stores/settingsStore';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const isOnline = useOnlineStatus();
  const isDark = useSettingsStore((s) => s.theme) === 'dark';

  const bg = isDark ? undefined : '#fff';
  const border = isDark ? undefined : '1px solid #f0f0f0';

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: 'Tạo Talk Show' },
    { key: '/episodes', icon: <PlayCircleOutlined />, label: 'Tập của tôi' },
    { key: '/personas', icon: <TeamOutlined />, label: 'Persona' },
    { key: '/feed', icon: <GlobalOutlined />, label: 'Cộng đồng' },
    { key: '/profile', icon: <UserOutlined />, label: 'Hồ sơ' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Hồ sơ', onClick: () => navigate('/profile') },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={0}
        trigger={null}
        style={{ background: bg, borderRight: border }}
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Title level={4} style={{ color: '#6C5CE7', margin: 0 }}>
            {collapsed ? '🎙️' : '🎙️ Pdspyse ATS'}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none' }}
        />
      </Sider>

      <Layout>
        <Header style={{ background: bg, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: border }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 18 }}
            />
            {!isOnline && (
              <Tag icon={<DisconnectOutlined />} color="warning">
                Ngoại tuyến
              </Tag>
            )}
            {isOnline && (
              <Tag icon={<WifiOutlined />} color="success" style={{ opacity: 0.6 }}>
                Trực tuyến
              </Tag>
            )}
          </div>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Avatar style={{ background: '#6C5CE7', cursor: 'pointer' }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </Dropdown>
        </Header>

        <Content style={{ margin: 24, padding: 24, background: bg, borderRadius: 16, minHeight: 360 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
